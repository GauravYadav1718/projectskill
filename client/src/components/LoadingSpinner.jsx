import { Loader2, Sparkles } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#f8fafc]">
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
        
        {/* Main Spinner */}
        <div className="relative h-24 w-24 rounded-full border-4 border-slate-100 border-t-primary-600 animate-spin"></div>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary-600 animate-bounce" />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight animate-pulse">SkillSwap</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Initializing Workspace</p>
      </div>
    </div>
  )
}

export default LoadingSpinner