import "./styles.css";
// 1. Import the newly created component
import PremiumNavbar from "./PremiumNavbar";

export default function App() {
  return (
    <div className="App">
      {/* 2. Render the component */}
      <PremiumNavbar />
    </div>
  );
}
