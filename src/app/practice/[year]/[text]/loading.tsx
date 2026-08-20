export default function PracticeLoading() {
  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <div className="route-loading-mark" />
      <strong>正在打开练习</strong>
      <span>正在准备文章和题目……</span>
    </main>
  );
}
