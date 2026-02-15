import { Outlet, Link } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-fire-600">FireWall</span>
              <span className="text-sm text-slate-500">NCC Compliance Tool</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-slate-400 text-center">
            This tool is for preliminary assessment only. It does not replace professional
            fire safety engineering judgment or formal NCC compliance checking by a qualified
            practitioner. FRL table values for Type B and C construction should be verified
            against the current NCC Volume One.
          </p>
        </div>
      </footer>
    </div>
  );
}
