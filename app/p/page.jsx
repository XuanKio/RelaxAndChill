import Editor from '../../components/Editor';
export const metadata = { title: 'Chơi cùng mình 🐾 — RelaxAndChill' };
export default function Page() {
  return <><link rel="stylesheet" href="editor.css?v=short-links" /><link rel="stylesheet" href="studio.css?v=short-links" /><Editor playOnly /></>;
}
