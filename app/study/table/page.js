import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MorseTable from "@/components/MorseTable";

export default function MorseTablePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/study"
        className="inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Study
      </Link>

      <div>
        <h1 className="page-title">Кодын хүснэгт</h1>
        <p className="page-subtitle">
          Тэмдэгт дээр дарж дуугаар сонсох болон бичих дадлага хийх боломжтой.
        </p>
      </div>

      <MorseTable />
    </div>
  );
}
