import { NzHeader } from "@/components/nz-header";
import { NzFooter } from "@/components/nz-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <NzHeader />
      <main className="flex-1">{children}</main>
      <div className="nz-dark nz-band" style={{ marginTop: "4rem" }}>
        <NzFooter />
      </div>
    </div>
  );
}
