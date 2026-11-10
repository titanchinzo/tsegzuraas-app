"""Build the aimag-region map for components/MongoliaMap.js.

Usage (from the repo root, stdlib only):
  curl -sLo /tmp/mng.geojson https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/MNG/ADM1/geoBoundaries-MNG-ADM1_simplified.geojson
  python3 scripts/gen-mongolia-map.py /tmp/mng.geojson lib/mongoliaMap.js public/mongolia-map.svg

Input: geoBoundaries gbOpen MNG ADM1 simplified (OpenStreetMap, ODbL 1.0), 22 units.
Shared borders are split into arcs at junctions and each arc is simplified once,
so neighbouring aimags keep identical borders (no gaps/overlaps).
"""
import json
import math
import sys

src, out_js, out_svg = sys.argv[1:4]

NAME_TO_KEY = {
    "Ulaanbaatar": "ulaanbaatar", "Arkhangai": "arkhangai", "Bayan-Ölgii": "bayan-ulgii",
    "Bayankhongor": "bayankhongor", "Bulgan": "bulgan", "Govi-Altai": "govi-altai",
    "Govisumber": "govisumber", "Darkhan-Uul": "darkhan-uul", "Dornogovi": "dornogovi",
    "Dornod": "dornod", "Dundgovi": "dundgovi", "Zavkhan": "zavkhan", "Orkhon": "orkhon",
    "Övörkhangai": "uvurkhangai", "Ömnögovi": "umnugovi", "Sükhbaatar": "sukhbaatar",
    "Selenge": "selenge", "Töv": "tuv", "Uvs": "uvs", "Khovd": "khovd", "Hovsgel": "khuvsgul",
    "Khentii": "khentii",
}
# Aimag centres, only to sanity-check that every region got the right key.
CENTRES = {
    "ulaanbaatar": (47.918, 106.917), "arkhangai": (47.475, 101.454), "bayan-ulgii": (48.968, 89.962),
    "bayankhongor": (46.194, 100.718), "bulgan": (48.812, 103.534), "govi-altai": (46.372, 96.258),
    "govisumber": (46.361, 108.361), "darkhan-uul": (49.487, 105.951), "dornogovi": (44.892, 110.14),
    "dornod": (48.072, 114.528), "dundgovi": (45.763, 106.271), "zavkhan": (47.741, 96.845),
    "orkhon": (49.028, 104.044), "uvurkhangai": (46.265, 102.775), "umnugovi": (43.571, 104.425),
    "sukhbaatar": (46.681, 113.281), "selenge": (50.232, 106.208), "tuv": (47.707, 106.953),
    "uvs": (49.981, 92.067), "khovd": (48.006, 91.641), "khuvsgul": (49.638, 100.163),
    "khentii": (47.319, 110.656),
}

features = json.load(open(src))["features"]
regions = {}  # key -> list of polygons, each a list of rings (outer first)
for f in features:
    key = NAME_TO_KEY[f["properties"]["shapeName"]]
    g = f["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    regions[key] = [[[(round(x, 7), round(y, 7)) for x, y in ring[:-1]] for ring in poly] for poly in polys]
assert sorted(regions) == sorted(CENTRES), "region/key mismatch"

# --- projection (equirectangular, true scale at ~47°N) -------------------------
allpts = [p for polys in regions.values() for poly in polys for p in poly[0]]
LON0 = min(p[0] for p in allpts)
LAT_MAX = max(p[1] for p in allpts)
KX = math.cos(math.radians(47))
WIDTH, PAD = 1000, 12
K = (WIDTH - 2 * PAD) / ((max(p[0] for p in allpts) - LON0) * KX)
HEIGHT = round((LAT_MAX - min(p[1] for p in allpts)) * K + 2 * PAD)


def project(p):
    return (PAD + (p[0] - LON0) * KX * K, PAD + (LAT_MAX - p[1]) * K)


# --- topology: split rings into arcs at junctions -------------------------------
edge_owners = {}
for key, polys in regions.items():
    for ring in (r for poly in polys for r in poly):
        for i in range(len(ring)):
            e = frozenset((ring[i], ring[(i + 1) % len(ring)]))
            edge_owners.setdefault(e, set()).add(key)


def ring_arcs(key, ring):
    n = len(ring)
    nb = [frozenset(edge_owners[frozenset((ring[i], ring[(i + 1) % n]))] - {key}) for i in range(n)]
    junctions = [i for i in range(n) if nb[i - 1] != nb[i]]
    if not junctions:
        # Whole ring borders one neighbour (a hole) or nothing: cut it at two
        # canonical points so both sides split it identically.
        a = min(range(n), key=lambda i: ring[i])
        b = max(range(n), key=lambda i: (ring[i][0] - ring[a][0]) ** 2 + (ring[i][1] - ring[a][1]) ** 2)
        junctions = sorted({a, b})
    arcs = []
    for j, start in enumerate(junctions):
        end = junctions[(j + 1) % len(junctions)]
        idx = list(range(start, end + 1)) if end > start else list(range(start, n)) + list(range(0, end + 1))
        arcs.append(([ring[i] for i in idx], nb[start]))
    return arcs


def dp(points, eps):
    """Douglas-Peucker on projected points, endpoints kept."""
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy)
    best, bi = -1.0, 0
    for i in range(1, len(points) - 1):
        px, py = points[i]
        d = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / norm if norm else math.hypot(px - x1, py - y1)
        if d > best:
            best, bi = d, i
    if best <= eps:
        return [points[0], points[-1]]
    return dp(points[: bi + 1], eps)[:-1] + dp(points[bi:], eps)


EPS = 0.55  # map units (~0.5 px on a 900 px wide map)
simplified = {}  # canonical arc -> simplified projected points
inner_borders, outer_borders = [], []


def simplify_arc(arc, neighbours):
    canon = min(tuple(arc), tuple(reversed(arc)))
    if canon not in simplified:
        simplified[canon] = dp([project(p) for p in canon], EPS)
        (inner_borders if neighbours else outer_borders).append(simplified[canon])
    pts = simplified[canon]
    return pts if tuple(arc) == canon else list(reversed(pts))


region_polys = {}
for key, polys in regions.items():
    out_polys = []
    for poly in polys:
        out_rings = []
        for ring in poly:
            pts = []
            for arc, neighbours in ring_arcs(key, ring):
                seg = simplify_arc(arc, neighbours)
                pts.extend(seg if not pts else seg[1:])
            if pts[0] == pts[-1]:
                pts.pop()
            out_rings.append(pts)
        out_polys.append(out_rings)
    region_polys[key] = out_polys
# Flat ring lists for even-odd tests and paths (parts are disjoint, holes inside their outer ring).
region_rings = {k: [r for poly in polys for r in poly] for k, polys in region_polys.items()}


def ring_area(ring):
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]))) / 2


# --- geometry helpers ----------------------------------------------------------
def inside_ring(x, y, ring):
    hit = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            hit = not hit
    return hit


def inside_region(x, y, rings):  # even-odd: holes excluded
    return sum(inside_ring(x, y, r) for r in rings) % 2 == 1


def seg_dist(px, py, x1, y1, x2, y2):
    dx, dy = x2 - x1, y2 - y1
    t = max(0, min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy or 1)))
    return math.hypot(px - x1 - t * dx, py - y1 - t * dy)


def label_point(rings):
    """Interior point farthest from any edge (coarse pole of inaccessibility)."""
    xs = [x for x, _ in rings[0]]
    ys = [y for _, y in rings[0]]
    edges = [(a, b) for r in rings for a, b in zip(r, r[1:] + r[:1])]
    best, bp = -1, None
    step = max(1.5, (max(xs) - min(xs)) / 40)
    y = min(ys) + step / 2
    while y < max(ys):
        x = min(xs) + step / 2
        while x < max(xs):
            if inside_region(x, y, rings):
                d = min(seg_dist(x, y, *a, *b) for a, b in edges)
                if d > best:
                    best, bp = d, (x, y)
            x += step
        y += step
    return bp


# --- checks ---------------------------------------------------------------------
for key, (lat, lng) in CENTRES.items():
    x, y = project((lng, lat))
    owner = [k for k, rings in region_rings.items() if inside_region(x, y, rings)]
    assert owner == [key], f"{key} centre falls in {owner}"


def fmt(pts):
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts)


regions_js = []
for key in CENTRES:  # same order as lib/aimags.js
    rings = region_rings[key]
    # Label on the largest part (Ulaanbaatar also has the Baganuur/Bagakhangai exclaves).
    lx, ly = label_point(max(region_polys[key], key=lambda poly: ring_area(poly[0])))
    d = "".join(fmt(r) + "Z" for r in rings)
    regions_js.append(f'  {{ key: "{key}", labelX: {lx:.1f}, labelY: {ly:.1f}, d: "{d}" }},')

# Dot grid inside the country.
STEP = 11
dots = []
y = PAD + STEP / 2
while y < HEIGHT:
    x = PAD + STEP / 2
    while x < WIDTH:
        if any(inside_region(x, y, r) for r in region_rings.values()):
            dots.append(f"M{x:.1f} {y:.1f}h0")
        x += STEP
    y += STEP

js = f"""// Монгол Улсын аймаг, нийслэлийн хил (geoBoundaries MNG ADM1 ← © OpenStreetMap
// contributors, ODbL 1.0) — SVG координат руу урьдчилан хөрвүүлж, хөрш
// аймгуудын хуваалцсан хилийг нэг удаа хялбарчилсан. Цэгэн тор, улсын болон
// аймаг хоорондын хил нь public/mongolia-map.svg (статик, кэшлэгдэнэ); энд
// зөвхөн hover/асах аймгийн хэлбэрүүд. labelX/labelY — тайлбар гарах дотоод цэг.
// Эх сурвалж: https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/MNG/ADM1/geoBoundaries-MNG-ADM1_simplified.geojson
// scripts/gen-mongolia-map.py-ээр үүсгэсэн — гараар засахгүй.
export const MAP_WIDTH = {WIDTH};
export const MAP_HEIGHT = {HEIGHT};

export const REGIONS = [
{chr(10).join(regions_js)}
];
"""

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" width="{WIDTH}" height="{HEIGHT}">'
    f'<path d="{"".join(dots)}" stroke="#fff" stroke-opacity="0.2" stroke-width="4" stroke-linecap="round"/>'
    f'<path d="{"".join(fmt(a) for a in inner_borders)}" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="1" stroke-linejoin="round"/>'
    f'<path d="{"".join(fmt(a) for a in outer_borders)}" fill="none" stroke="#0d9488" stroke-opacity="0.7" stroke-width="2" stroke-linejoin="round"/>'
    "</svg>\n"
)

open(out_js, "w").write(js)
open(out_svg, "w").write(svg)
npts = sum(len(r) for rings in region_rings.values() for r in rings)
print(f"viewBox {WIDTH}x{HEIGHT}; {len(simplified)} arcs ({len(inner_borders)} inner, {len(outer_borders)} outer);"
      f" {npts} region pts; {len(dots)} dots; js {len(js)} B; svg {len(svg)} B")
