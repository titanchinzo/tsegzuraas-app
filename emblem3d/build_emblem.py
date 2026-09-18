# Build a 3D bas-relief version of emblem.jpg in Blender.
# Run:  blender -b --python build_emblem.py -- [--quick]
import bpy, bmesh, numpy as np, os, sys, math, time

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "emblem.jpg")
QUICK = "--quick" in sys.argv

# ---------------- parameters (tweak freely) ----------------
PLATE_W = 1.024           # world width of the image plane (1 px = 1 mm)
RELIEF = 0.12             # max relief height (wolf top) in world units
PLATE_T = 0.05            # plate thickness
GRID_X = 700 if not QUICK else 350
GOLD_H, SILVER_H, WOLF_EDGE_H = 0.20, 0.16, 0.14   # relative to RELIEF
WOLF_CX, WOLF_CY, WOLF_RX, WOLF_RY = 510, 685, 208, 198   # wolf ellipse (px)

t0 = time.time()
def log(*a): print(f"[{time.time()-t0:6.1f}s]", *a, flush=True)

# ---------------- image helpers ----------------
def box_blur(a, r):
    if r <= 0: return a.astype(np.float32)
    a = a.astype(np.float32)
    for axis in (0, 1):
        n = a.shape[axis]
        pad = [(r, r) if ax == axis else (0, 0) for ax in (0, 1)]
        c = np.cumsum(np.pad(a, pad, mode='edge'), axis=axis, dtype=np.float64)
        zero = np.zeros_like(np.take(c, [0], axis=axis))
        c = np.concatenate([zero, c], axis=axis)
        hi = np.take(c, np.arange(2*r+1, 2*r+1+n), axis=axis)
        lo = np.take(c, np.arange(0, n), axis=axis)
        a = ((hi - lo) / (2*r+1)).astype(np.float32)
    return a
def gauss(a, r):
    for _ in range(3): a = box_blur(a, max(1, int(round(r*0.6))))
    return a
def dilate(m, r):
    m = m.copy()
    for _ in range(r):
        p = np.pad(m, 1)
        m = p[1:-1,1:-1] | p[:-2,1:-1] | p[2:,1:-1] | p[1:-1,:-2] | p[1:-1,2:]
    return m
def erode(m, r): return ~dilate(~m, r)
def close_(m, r): return erode(dilate(m, r), r)
def open_(m, r): return dilate(erode(m, r), r)
def flood(free, seeds):
    """Grow `seeds` through `free` pixels (4-connected) using run propagation."""
    out = seeds & free
    for _ in range(200):
        before = out.sum()
        for axis in (1, 0):
            o = out if axis == 1 else out.T
            f = ~free if axis == 1 else (~free).T
            n, m = f.shape
            seg = np.cumsum(f, axis=1, dtype=np.int32) + (np.arange(n, dtype=np.int32)*(m+1))[:, None]
            flags = np.zeros(int(seg.max())+1, dtype=bool)
            flags[seg[o]] = True
            new = flags[seg] & ~f
            out = out | (new if axis == 1 else new.T)
        if out.sum() == before: break
    return out
def dist_inside(m, maxd):
    d = np.zeros(m.shape, np.float32); cur = m.copy()
    for _ in range(maxd):
        cur = erode(cur, 1); d += cur
    return d
def smoothstep(x): x = np.clip(x, 0, 1); return x*x*(3-2*x)

# ---------------- load image ----------------
img = bpy.data.images.load(SRC)
W, H = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)[::-1]   # row 0 = top
r, g, b = px[..., 0], px[..., 1], px[..., 2]
lum = 0.299*r + 0.587*g + 0.114*b
mx, mn = px[..., :3].max(-1), px[..., :3].min(-1)
log("image loaded", W, H)

fg = lum > 0.05
yy, xx = np.mgrid[0:H, 0:W]
# The maroon ring is nearly black at the bottom, so fit an ellipse to the outer rim
# (rows not covered by the ribbon) and union it with the bright parts of the image.
pts = []
for y in list(range(230, 1040, 2)) + list(range(1215, H, 2)):
    xs = np.where(fg[y])[0]
    if len(xs): pts += [(xs.min(), y), (xs.max(), y)]
P = np.array(pts, np.float64)
for _ in range(3):
    M = np.stack([P[:, 0]**2, P[:, 1]**2, P[:, 0], P[:, 1]], 1)
    A, B, C, D = np.linalg.lstsq(M, np.ones(len(P)), rcond=None)[0]
    res = np.abs(M @ np.array([A, B, C, D]) - 1)
    P = P[res < np.percentile(res, 85)]
cx, cy = -C/(2*A), -D/(2*B)
k = 1 + A*cx**2 + B*cy**2
rx, ry = math.sqrt(k/A), math.sqrt(k/B)
log(f"rim ellipse centre=({cx:.0f},{cy:.0f}) rx={rx:.0f} ry={ry:.0f}")
ellipse = (((xx-cx)/(rx+3))**2 + ((yy-cy)/(ry+3))**2) <= 1.0
seed = np.zeros_like(fg); seed[H//2, W//2] = True
inside = flood(ellipse | close_(fg, 3), seed)      # rim ellipse + ribbon, one piece
inside = close_(open_(inside, 1), 2)
log("silhouette", inside.sum())

blue   = (b > r + 0.12) & (b > g + 0.03)
red    = (r > 0.18) & (g < 0.45*r) & (b < 0.6*r)
green  = (g > r + 0.05) & (g > b + 0.05)
gold   = (r > 0.40) & (g > 0.50*r) & (g < 0.92*r) & (b < 0.50*r)
gold_s = gold & (r > 0.55) & (b < 0.35*r) & (g > 0.60*r)
white  = (lum > 0.55) & ((mx - mn) < 0.15)

# ---------------- wolf mask ----------------
ell = (((xx-WOLF_CX)/WOLF_RX)**2 + ((yy-WOLF_CY)/WOLF_RY)**2) <= 1.0
wolf = ell & fg & ~blue & ~green & ~gold_s
wolf &= ~(red & ((yy > 765) | (yy < 560)))          # shield below, flags above
wolf = close_(wolf, 10)
seedw = np.zeros_like(wolf); seedw[WOLF_CY-30, WOLF_CX] = True
wolf = flood(wolf, seedw)
wolf = open_(wolf, 2)
wolf_soft = gauss(wolf.astype(np.float32), 4)
dome = smoothstep(dist_inside(wolf, 55) / 55.0)
dome = gauss(dome, 6)
# nose: darkest blob near the muzzle -> bump it forward instead of sinking it
nz = (lum < 0.12) & (np.abs(xx-512) < 45) & (np.abs(yy-722) < 40)
ny_, nx_ = np.where(nz)
ncx, ncy = (nx_.mean(), ny_.mean()) if len(nx_) > 50 else (512, 722)
nose = np.exp(-(((xx-ncx)/26.0)**2 + ((yy-ncy)/22.0)**2))
log("wolf mask px", wolf.sum(), "nose at", round(ncx), round(ncy))

lum_s = gauss(lum, 1.5)
lum_lo = gauss(lum, 14)
h_wolf = dome * (0.34 + 0.36*lum_lo + 0.30*lum_s) + 0.30*nose*dome
h_wolf = WOLF_EDGE_H + (1.0 - WOLF_EDGE_H) * np.clip(h_wolf, 0, 1)

# ---------------- other layers ----------------
def clean(m, r=1):
    return gauss(open_(close_(m, r), r).astype(np.float32), 2.5)
gold_raise = clean(gold & inside & ~wolf)
silver_raise = clean(white & inside & ~wolf & ~gold)
h = np.zeros((H, W), np.float32)
h = np.maximum(h, GOLD_H * gold_raise)
h = np.maximum(h, SILVER_H * silver_raise)
h = h * (1 - wolf_soft) + h_wolf * wolf_soft
h = np.clip(h, 0, 1) * inside
log("height map done; max", h.max())

def save_img(name, arr, fmt, float_buffer, ext):
    Hh, Ww = arr.shape[:2]
    im = bpy.data.images.new(name, Ww, Hh, alpha=False, float_buffer=float_buffer)
    rgba = np.empty((Hh, Ww, 4), np.float32)
    if arr.ndim == 2:
        rgba[..., 0] = rgba[..., 1] = rgba[..., 2] = arr
    else:
        rgba[..., :3] = arr
    rgba[..., 3] = 1.0
    im.pixels.foreach_set(rgba[::-1].ravel())
    path = os.path.join(HERE, name + ext)
    im.filepath_raw = path; im.file_format = fmt; im.save()
    bpy.data.images.remove(im)
    im = bpy.data.images.load(path)
    im.colorspace_settings.name = 'Non-Color'
    return im
height_img = save_img("emblem_height", h, 'OPEN_EXR', True, ".exr")
metal_img = save_img("emblem_metal", np.clip(gold_raise*1.2, 0, 1), 'PNG', False, ".png")
log("maps saved")

# ---------------- mesh ----------------
GRID_Y = int(round(GRID_X * H / W))
u = np.linspace(0, 1, GRID_X, dtype=np.float32); v = np.linspace(0, 1, GRID_Y, dtype=np.float32)
uu, vv = np.meshgrid(u, v)
X = (uu - 0.5) * PLATE_W; Y = (0.5 - vv) * PLATE_W * H / W
vin = inside[np.round(vv*(H-1)).astype(int), np.round(uu*(W-1)).astype(int)]
fin = vin[:-1, :-1] & vin[:-1, 1:] & vin[1:, 1:] & vin[1:, :-1]
vused = np.zeros_like(vin)
vused[:-1, :-1] |= fin; vused[:-1, 1:] |= fin; vused[1:, 1:] |= fin; vused[1:, :-1] |= fin
idx = -np.ones(vin.shape, np.int64); idx[vused] = np.arange(vused.sum())
verts = np.stack([X[vused], Y[vused], np.zeros(vused.sum(), np.float32)], 1)
jj, ii = np.where(fin)
faces = np.stack([idx[jj, ii], idx[jj+1, ii], idx[jj+1, ii+1], idx[jj, ii+1]], 1)
vert_uv = np.stack([uu[vused], 1 - vv[vused]], 1)
log("grid", verts.shape[0], "verts", faces.shape[0], "faces")

me = bpy.data.meshes.new("Emblem")
me.from_pydata(verts.tolist(), [], faces.tolist())
uvl = me.uv_layers.new(name="UVMap")
uvl.data.foreach_set("uv", vert_uv[faces.ravel()].ravel())
me.update()

bm = bmesh.new(); bm.from_mesh(me)
for f in bm.faces: f.smooth = True
boundary = [e for e in bm.edges if e.is_boundary]
for e in boundary: e.smooth = False
# smooth the pixel-staircase outline before extruding the side wall
from mathutils import Vector
bverts = {v for e in boundary for v in e.verts}
nbrs = {v: [e.other_vert(v) for e in v.link_edges if e.is_boundary] for v in bverts}
for _ in range(8):
    new_co = {v: v.co*0.5 + (nbrs[v][0].co + nbrs[v][1].co)*0.25 for v in bverts if len(nbrs[v]) == 2}
    for v, c in new_co.items(): v.co = c
ret = bmesh.ops.extrude_edge_only(bm, edges=boundary)
new_verts = [x for x in ret['geom'] if isinstance(x, bmesh.types.BMVert)]
side_faces = [x for x in ret['geom'] if isinstance(x, bmesh.types.BMFace)]
bmesh.ops.translate(bm, verts=new_verts, vec=(0, 0, -PLATE_T))
bottom_edges = [e for e in bm.edges if e.is_boundary and all(v.co.z < -PLATE_T/2 for v in e.verts)]
for e in bottom_edges: e.smooth = False
cap_faces = []
try:
    cap = bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False, edges=bottom_edges)
    cap_faces = [x for x in cap['geom'] if isinstance(x, bmesh.types.BMFace)]
except Exception as ex:
    print("cap fill failed:", ex)
for f in side_faces + cap_faces:
    f.material_index = 1; f.smooth = True
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
bm.to_mesh(me); bm.free(); me.update()
log("mesh built; sides", len(side_faces), "cap", len(cap_faces))

obj = bpy.data.objects.new("Emblem", me)
scene = bpy.context.scene
for o in list(scene.objects): bpy.data.objects.remove(o, do_unlink=True)
scene.collection.objects.link(obj)
top_ids = [vtx.index for vtx in me.vertices if vtx.co.z > -PLATE_T/2]
vg = obj.vertex_groups.new(name="Top"); vg.add(top_ids, 1.0, 'REPLACE')

tex = bpy.data.textures.new("EmblemHeight", type='IMAGE')
tex.image = height_img; tex.extension = 'EXTEND'; tex.use_interpolation = True
mod = obj.modifiers.new("Relief", 'DISPLACE')
mod.texture = tex; mod.texture_coords = 'UV'; mod.uv_layer = "UVMap"
mod.direction = 'Z'; mod.mid_level = 0.0; mod.strength = RELIEF; mod.vertex_group = "Top"

# ---------------- materials ----------------
def new_mat(name):
    m = bpy.data.materials.new(name)
    if hasattr(m, "use_nodes"): m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    return m, nt, bsdf
color_img = bpy.data.images.load(SRC)
m0, nt, bsdf = new_mat("EmblemFace")
tc = nt.nodes.new("ShaderNodeTexImage"); tc.image = color_img
tm = nt.nodes.new("ShaderNodeTexImage"); tm.image = metal_img
nt.links.new(tc.outputs["Color"], bsdf.inputs["Base Color"])
nt.links.new(tm.outputs["Color"], bsdf.inputs["Metallic"])
rough = nt.nodes.new("ShaderNodeMapRange")
rough.inputs["From Min"].default_value = 0; rough.inputs["From Max"].default_value = 1
rough.inputs["To Min"].default_value = 0.5; rough.inputs["To Max"].default_value = 0.25
nt.links.new(tm.outputs["Color"], rough.inputs["Value"])
nt.links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
if "Coat Weight" in bsdf.inputs: bsdf.inputs["Coat Weight"].default_value = 0.1
m1, nt1, bsdf1 = new_mat("EmblemGold")
bsdf1.inputs["Base Color"].default_value = (0.83, 0.62, 0.20, 1)
bsdf1.inputs["Metallic"].default_value = 1.0; bsdf1.inputs["Roughness"].default_value = 0.3
me.materials.append(m0); me.materials.append(m1)

# ---------------- world, lights, camera ----------------
world = bpy.data.worlds.new("Studio")
if hasattr(world, "use_nodes"): world.use_nodes = True
scene.world = world
wn = world.node_tree
for n in list(wn.nodes): wn.nodes.remove(n)
wout = wn.nodes.new("ShaderNodeOutputWorld")
mix = wn.nodes.new("ShaderNodeMixShader")
bg_cam = wn.nodes.new("ShaderNodeBackground"); bg_cam.inputs["Color"].default_value = (0.004, 0.004, 0.005, 1)
bg_env = wn.nodes.new("ShaderNodeBackground"); bg_env.inputs["Strength"].default_value = 0.15
sky = wn.nodes.new("ShaderNodeTexSky")
try:
    sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(35); sky.sun_intensity = 0.0
except Exception: pass
lp = wn.nodes.new("ShaderNodeLightPath")
wn.links.new(sky.outputs[0], bg_env.inputs["Color"])
wn.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
wn.links.new(bg_env.outputs[0], mix.inputs[1]); wn.links.new(bg_cam.outputs[0], mix.inputs[2])
wn.links.new(mix.outputs[0], wout.inputs[0])

target = bpy.data.objects.new("Target", None); scene.collection.objects.link(target)
def aim(o):
    c = o.constraints.new('TRACK_TO'); c.target = target
    c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
def light(name, loc, energy, size, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.size = size; ld.color = color
    lo = bpy.data.objects.new(name, ld); lo.location = loc; scene.collection.objects.link(lo); aim(lo)
light("Key", (-2.2, -1.6, 2.4), 420, 1.5, (1, 0.96, 0.9))
light("Fill", (2.4, -1.8, 1.8), 110, 3.0, (0.9, 0.95, 1))
light("Rim", (0.8, 2.6, 1.6), 280, 1.0)

cam_d = bpy.data.cameras.new("Cam"); cam_d.lens = 85
cam = bpy.data.objects.new("Camera", cam_d); scene.collection.objects.link(cam); aim(cam)
scene.camera = cam

# ---------------- render settings ----------------
scene.render.engine = 'CYCLES'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for dev_type in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI', 'METAL'):
        try:
            prefs.compute_device_type = dev_type; prefs.get_devices()
            if any(d.type != 'CPU' for d in prefs.devices):
                for d in prefs.devices: d.use = True
                scene.cycles.device = 'GPU'; print("GPU render via", dev_type); break
        except Exception: continue
except Exception as ex: print("no GPU:", ex)
scene.cycles.samples = 32 if QUICK else 128
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = (600, 750) if QUICK else (1200, 1500)
scene.render.film_transparent = False
VT = sys.argv[sys.argv.index("--vt")+1] if "--vt" in sys.argv else "Standard"
try: scene.view_settings.view_transform = VT; scene.view_settings.look = 'None'
except Exception as ex: print("view transform:", ex)

cam.location = (-0.9, -1.3, 2.9)
blend = os.path.join(HERE, "emblem.blend")
try: bpy.ops.file.pack_all()        # images travel inside the .blend
except Exception as ex: print("pack:", ex)
bpy.ops.wm.save_as_mainfile(filepath=blend)
log("saved", blend)

wolf_xy = ((WOLF_CX/(W-1) - 0.5)*PLATE_W, (0.5 - WOLF_CY/(H-1))*PLATE_W*H/W)
views = {  # name: (camera location, look-at point)
    "front": ((0.0, -0.6, 3.1), (0, 0, 0)),
    "angle": ((-0.9, -1.3, 2.9), (0, 0, 0)),
    "wolf":  ((wolf_xy[0]-0.30, wolf_xy[1]-0.42, 1.05), (wolf_xy[0], wolf_xy[1], RELIEF*0.5)),
}
for name, (loc, at) in views.items():
    cam.location = loc; target.location = at
    scene.render.filepath = os.path.join(HERE, f"render_{name}.png")
    bpy.ops.render.render(write_still=True)
    log("rendered", name)
target.location = (0, 0, 0); cam.location = views["angle"][0]
