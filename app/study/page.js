import MorseTable from "@/components/MorseTable";

export default function StudyPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">📖 Study — Морзын код</h1>
        <p className="page-subtitle">
          Тэмдэгт дээр дарж дуугаар сонсох болон бичих дадлага хийх боломжтой.
        </p>
      </div>
      <MorseTable />
    </div>
  );
}
