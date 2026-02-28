export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-(--color-bg) flex items-start justify-center">
      <div className="w-full max-w-[375px] min-h-screen bg-(--color-bg) flex flex-col relative shadow-2xl">
        {children}
      </div>
    </div>
  );
}
