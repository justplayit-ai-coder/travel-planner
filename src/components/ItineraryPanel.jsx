import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, Trash2, Plus, Search, Map } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ItineraryPanel = ({ locations, setLocations }) => {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (query.trim().length > 2) {
      setIsSearching(true);
      setShowDropdown(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // Nominatim API call (Free, no key needed)
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
          const data = await res.json();
          setSearchResults(data);
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      }, 500); // 500ms debounce
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectResult = (result) => {
    setSearchQuery(result.display_name);
    setName(result.name || result.display_name.split(',')[0]);
    setLat(result.lat);
    setLng(result.lon);
    setShowDropdown(false);
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!name || !lat || !lng) return;

    const newLocation = {
      id: uuidv4(),
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: format(selectedDate, 'HH:mm'),
      timestamp: selectedDate.getTime()
    };

    const updatedLocations = [...locations, newLocation].sort((a, b) => a.timestamp - b.timestamp);
    setLocations(updatedLocations);
    
    // Reset form mostly, keep date
    setName('');
    setLat('');
    setLng('');
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeLocation = (id) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  return (
    <div className="panel-left glass-panel">
      <h2>Travel Itinerary</h2>
      
      <div className="itinerary-list">
        {locations.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
            No locations added yet. Search and add your first destination below!
          </div>
        ) : (
          locations.map((loc, index) => (
            <div key={loc.id} className="itinerary-item">
              <div className="item-header">
                <span className="item-title">{index + 1}. {loc.name}</span>
                <button className="btn-icon" onClick={() => removeLocation(loc.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                <div className="item-meta">
                  <Calendar size={14} /> {loc.date}
                </div>
                <div className="item-meta" style={{ color: 'var(--primary)' }}>
                  <Clock size={14} /> {loc.time}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="add-form-panel">
        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Add Destination</h3>
        
        <form onSubmit={handleAddLocation}>
          <div className="input-group" ref={searchRef} style={{ position: 'relative' }}>
            <label>Search Location</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-control search-input" 
                value={searchQuery} 
                onChange={handleSearchChange}
                placeholder="Type to search places..."
                style={{ paddingLeft: '34px', width: '100%' }}
              />
            </div>
            
            {showDropdown && (
              <div className="search-dropdown glass-panel">
                {isSearching ? (
                  <div className="dropdown-item" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <div 
                      key={result.place_id} 
                      className="dropdown-item"
                      onClick={() => handleSelectResult(result)}
                    >
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{result.name || result.display_name.split(',')[0]}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {result.display_name}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No results found</div>
                )}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label>Location Name (Editable)</label>
            <input 
              type="text" 
              className="input-control" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Taipei 101"
              required
            />
          </div>

          <div className="input-group">
            <label>Date & Time</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="input-control"
              wrapperClassName="date-picker-wrapper"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            <Plus size={18} /> Add to Itinerary
          </button>
        </form>
      </div>
    </div>
  );
};

export default ItineraryPanel;
