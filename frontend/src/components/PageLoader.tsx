const PageLoader = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoader;