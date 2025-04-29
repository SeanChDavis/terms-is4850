import {FaInfoCircle} from "react-icons/fa";

export default function InfoLink({ anchor, label = 'Info', className = '' }) {
    return (
        <a
            href={`/help#${anchor}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`ml-2 text-sm text-gray-600 hover:text-gray-800 ${className}`}
        >
            <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium">
                <FaInfoCircle className="inline mr-1" /> {label}
            </span>
        </a>
    );
}