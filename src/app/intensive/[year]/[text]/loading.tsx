export default function IntensiveLoading() {
  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <div className="route-loading-mark" />
      <strong>正在打开精读</strong>
      <span>正在准备文章和学习记录……</span>
    </main>
  );
}
