import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function BillingSoftware() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState('');
  const [bsDate, setBsDate] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dateType, setDateType] = useState('AD'); // Add this state
  const [hideSections, setHideSections] = useState(false);
  const searchInputRef = useRef(null);

  // Generate bill no and date on mount
  useEffect(() => {
    setBillNo('BILL-' + Date.now());
    setBillDate(new Date().toISOString().slice(0, 10));
  }, []);

  // Fetch parts from parts.json
  useEffect(() => {
    fetch('/data/parts.json')
      .then((res) => res.json())
      .then((data) => setParts(data));
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    if (search.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filtered = parts.filter((part) =>
      part.name.toLowerCase().includes(search.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  }, [search, parts]);

  // Keyboard navigation for suggestions
  useEffect(() => {
    setHighlightedIndex(-1); // Reset highlight when suggestions change
  }, [suggestions]);

  const handleSearchKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        addToBill(suggestions[highlightedIndex]);
      }
    }
  };

  const addToBill = (part) => {
    setBillItems((prev) => {
      const existing = prev.find((item) => item.id === part.id);
      if (existing) {
        return prev.map((item) =>
          item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...part, quantity: 1 }];
      }
    });
    setSearch('');
    setSuggestions([]);
  };

  const updateQuantity = (id, delta) => {
    setBillItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getTotal = () =>
    billItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // Generate the bill URL (replace with your actual domain/route)
  const billUrl = `https://your-domain.com/bill/${billNo}`;

  return (
    <div className="min-h-screen bg-yellow-200 py-10 px-2">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-3xl p-8 border border-yellow-100">
        <header className="flex flex-col items-center mb-10 relative">
          {/* QR Code at top right */}
          <div className="absolute right-0 top-0 mt-2 mr-2 z-10">
            <QRCodeSVG value={billUrl} size={96} />
          </div>
          <img
            src="/public/construction vehicle.png"
            alt="Logo"
            className="w-28 h-28 mb-3 drop-shadow-xl rounded-full border-4 border-yellow-200 bg-white"
          />
          <h1
            className="text-4xl font-extrabold text-yellow-800 tracking-tight text-center drop-shadow-sm cursor-pointer"
            onClick={(e) => {
              // Prevent refresh if the span is clicked
              if (e.target.tagName.toLowerCase() !== 'span') {
                window.location.reload();
              }
            }}
          >
            Sagarmatha Earthmoving Spare Parts
          </h1>
          <div className="mt-4 text-yellow-600 text-lg font-semibold flex items-center gap-4">
            <div>
              <label className="block text-yellow-700 text-center font-semibold mb-1">Bill No.</label>
              <input
                type="text"
                className="w-full min-w-[250px] max-w-[300px] p-3 border text-center border-gray-400 rounded-lg bg-gray-100 text-gray-700 font-mono text-base tracking-wider"
                value={billNo}
                readOnly
              />
            </div>
          </div>
        </header>
        {/* Customer & Bill Info */}
        <div className="bg-yellow-50 rounded-xl shadow-inner p-8 mb-10 grid grid-cols-1 md:grid-cols-3 gap-7 border-2 border-black">
          <div>
            <label className="block text-yellow-700 font-semibold mb-1">Name :</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-600 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="Enter name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-yellow-700 font-semibold mb-1">Address :</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-600 rounded-lg text-black placeholder-gray-6400 focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="Enter address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-yellow-700 font-semibold mb-1">Date:</label>
            <div className="flex gap-2">
              <select
                className="p-3 border border-gray-600 rounded-lg text-black bg-yellow-50"
                value={dateType}
                onChange={e => setDateType(e.target.value)}
              >
                <option value="AD">AD</option>
                <option value="BS">BS</option>
              </select>
              <input
                type={dateType === 'AD' ? 'date' : 'text'}
                className="w-full min-w-[160px] max-w-[200px] p-3 border border-gray-600 rounded-lg text-black focus:ring-2 focus:ring-yellow-400 outline-none text-base"
                placeholder={dateType === 'AD' ? 'YYYY-MM-DD' : 'YYYY-MM-DD'}
                value={dateType === 'AD' ? billDate : bsDate}
                onChange={e =>
                  dateType === 'AD' ? setBillDate(e.target.value) : setBsDate(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Search Section */}
          {!hideSections && (
            <section className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-black rounded-2xl shadow p-8 flex flex-col">
              <h2 className="text-2xl font-bold mb-6 text-yellow-700 flex items-center gap-2">
                {/* <span className="material-icons text-yellow-400">search</span> */}
                Search Parts
              </h2>
              <input
                type="text"
                ref={searchInputRef}
                className="w-full p-4 border border-gray-600 rounded-xl mb-4 text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none text-lg"
                placeholder="Search parts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <ul className="bg-white border border-yellow-200 rounded-xl shadow-lg mb-2 max-h-56 overflow-y-auto">
                  {suggestions.map((part, idx) => (
                    <li
                      key={part.id}
                      className={`flex justify-between items-center px-5 py-3 cursor-pointer transition ${
                        idx === highlightedIndex
                          ? 'bg-yellow-200 text-yellow-900'
                          : 'hover:bg-yellow-100'
                      }`}
                      onClick={() => addToBill(part)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      <span className="text-gray-800 font-medium">{part.name}</span>
                      <span className="text-yellow-600 font-semibold">Rs.{part.price}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 text-center text-yellow-400 text-sm italic">
                Tip: Use ↑/↓ to navigate, Enter to select, or click a part to add it to the bill.
              </div>
            </section>
          )}
          {/* Bill Section */}
          <section className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-black rounded-2xl shadow p-8 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-yellow-700 flex items-center gap-2">
              {/* <span className="material-icons text-yellow-400">receipt_long</span> */}
              Bill
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm rounded-lg overflow-hidden shadow-sm leading-tight">
                <thead>
                  <tr className="bg-yellow-100 text-yellow-800 border-2 border-gray-200">
                    <th className="text-left px-2 py-1">S.No</th>
                    <th className="text-left px-2 py-1">Parts</th>
                    <th className="px-2 py-1">Qty</th>
                    <th className="px-2 py-1">Price</th>
                    <th className="px-2 py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, idx) => (
                    <tr key={item.id} className="border-b last:border-b-0 hover:bg-yellow-50 transition">
                      <td className="px-2 py-1">{idx + 1}</td>
                      <td className="px-2 py-1">{item.name}</td>
                      <td className="px-2 py-1">
                        <div className="flex items-center gap-1">
                          <button
                            className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded px-2 py-0.5 font-bold transition"
                            onClick={() => updateQuantity(item.id, -1)}
                          >-</button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded px-2 py-0.5 font-bold transition"
                            onClick={() => updateQuantity(item.id, 1)}
                          >+</button>
                        </div>
                      </td>
                      <td className="px-2 py-1">Rs.{item.price}</td>
                      <td className="px-2 py-1 font-semibold">Rs.{item.price * item.quantity}</td>
                    </tr>
                  ))}
                  {billItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-400 py-4 text-base">
                        No items added.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right font-bold pt-3 text-yellow-800 text-base">Grand Total:</td>
                    <td className="font-bold pt-3 text-yellow-900 text-base">Rs.{getTotal()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>
        {/* Save and Print Buttons */}
          <div className="flex flex-col md:flex-row justify-end gap-6 mt-12">
            {/* Contact Us Section */}
            <div className="flex-1 flex items-center md:justify-start justify-center mb-4 md:mb-0">
              <div className="bg-yellow-100 border-2 border-black rounded-xl px-6 py-4 shadow text-yellow-800 text-base font-semibold w-full max-w-xs">
                <div className="mb-1 font-bold text-yellow-700">Contact Us</div>
                <div>
                  Phone: <a href="tel:9852025990" className="underline hover:text-yellow-600">9852025990</a> / <a href="tel:9801044291" className="underline hover:text-yellow-600">9801044291</a>
                </div>
                <div>
                  Email: <a href="mailto:sagarmatha.spareparts@email.com" className="underline hover:text-yellow-600">sagarmatha.spareparts@email.com</a>
                </div>
                <div>
                  Address: <span className="text-yellow-700">Itahari, Nepal</span>
                </div>
              </div>
            </div>
            {/* Save and Print Buttons */}
            {!hideSections && (
              <>
                <button
                  className="bg-yellow-600 shadow-lg mt-24 shadow-gray-400 text-white px-10 cursor-pointer rounded-xl font-bold hover:bg-yellow-700 transition text-lg"
                  onClick={() => {
                    alert('Bill saved!');
                    setSearch('');
                    setSuggestions([]);
                  }}
                >
                  Save
                </button>
                <button
                  className="shadow-lg mt-24 shadow-gray-400 text-white px-10 cursor-pointer rounded-xl font-bold hover:bg-yellow-800 transition text-lg"
                  onClick={() => {
                    setHideSections(true);
                    setTimeout(() => {
                      window.print();
                      setHideSections(false);
                    }, 100);
                  }}
                >
                  Print
                </button>
              </>
            )}
          </div>
      </div>
    </div>
  );
}