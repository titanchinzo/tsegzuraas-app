import MorseTable from "@/components/MorseTable";

export default function StudyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-darker">Study — Морзын код</h1>
        <p className="text-ink/70 text-sm mt-1">
          Тэмдэгт дээр дарж дуугаар сонсох болон бичих дадлага хийх боломжтой.
        </p>
      </div>
      <MorseTable />
    </div>
  );
}
