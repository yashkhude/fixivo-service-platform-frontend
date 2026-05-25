import { Navbar } from "../components/Navbar";
import { HomePage } from "./HomeScreen/page";
import { Footer } from "../components/Footer";

export default function MainScreen() {
    return (
        <div>
            <Navbar />
            <HomePage />
            <Footer />
        </div>
    );
}

