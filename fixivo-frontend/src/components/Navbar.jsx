    import { useState } from "react";
    import { Link } from "react-router-dom";
    import { Menu, X, MapPin, ChevronDown, Wrench } from "lucide-react";
    import "../index.css";

    export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    //   const categories = [
    //     "Plumbing",
    //     "Electrical",
    //     "AC Repair",
    //     "Cleaning",
    //     "Painting",
    //     "Carpentry",
    //     "Appliance Repair",
    //   ];



    
    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1E40AF] rounded-xl flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-[#1E40AF]">
                Fixivo
                </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="nav-link">Home</Link>

                {/* Services Dropdown */}
                <div className="relative group">
                <button className="nav-link flex items-center gap-1">
                    Services
                </button>

                {/* <div className="dropdown-menu">
                    {categories.map((cat) => (
                    <Link
                        key={cat}
                        to={`/services/${cat.toLowerCase().replace(" ", "-")}`}
                        className="dropdown-item"
                    >
                        {cat}
                    </Link>
                    ))}
                </div> */}
                </div>

                <Link to="/become-partner" className="nav-link">
                For Professionals
                </Link>
            </div>

            {/* Location */}
            {/* <div className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Mumbai</span>
                <ChevronDown className="w-3 h-3" />
            </div> */}

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-outline">Login</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>

            </div>

            {/* Mobile Menu Button */}
            <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X /> : <Menu />}
            </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
                <div className="flex flex-col gap-2">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/services/all" onClick={() => setIsMenuOpen(false)}>Services</Link>
                {/* <Link to="/become-partner" onClick={() => setIsMenuOpen(false)}>For Professionals</Link> */}
                </div>
            </div>
            )}
        </div>
        </nav>
    );
    }