import { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { useJodo } from '../../context/JodoContext';
import {
  INDIAN_STATES, CITIES_BY_STATE, BHOPAL_WARDS, BHOPAL_AREAS, DEFAULT_PROFILE,
} from '../../data/locations';
import JodoLogo from '../shared/JodoLogo';

export default function OnboardingScreen() {
  const { completeOnboarding, showToast } = useJodo();
  const [state, setState] = useState(DEFAULT_PROFILE.state);
  const [city, setCity] = useState(DEFAULT_PROFILE.city);
  const [ward, setWard] = useState(DEFAULT_PROFILE.ward);
  const [locality, setLocality] = useState('mp_nagar');
  const [locating, setLocating] = useState(false);

  const cities = CITIES_BY_STATE[state] || [];
  const localities = Object.entries(BHOPAL_AREAS);

  const handleLocationShare = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest = localities[0];
        let minDist = Infinity;
        localities.forEach(([key, area]) => {
          const d = (area.lat - latitude) ** 2 + (area.lng - longitude) ** 2;
          if (d < minDist) { minDist = d; nearest = [key, area]; }
        });
        setState('Madhya Pradesh');
        setCity('Bhopal');
        setWard(nearest[1].ward);
        setLocality(nearest[0]);
        setLocating(false);
        showToast(`Location detected near ${nearest[1].label}`);
      },
      () => { setLocating(false); showToast('Could not get location — select manually'); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const area = BHOPAL_AREAS[locality] || BHOPAL_AREAS.mp_nagar;
    completeOnboarding({
      state, city, ward, locality: area.label,
      lat: area.lat, lng: area.lng,
    });
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card fade-in">
        <JodoLogo size={48} />
        <h1>Where are you from?</h1>
        <p>Help us show relevant civic issues in your neighbourhood</p>

        <button type="button" className="btn-location" onClick={handleLocationShare} disabled={locating}>
          <MapPin size={18} />
          {locating ? 'Detecting location…' : 'Share Current Location'}
        </button>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <label>State
            <select value={state} onChange={e => { setState(e.target.value); setCity(CITIES_BY_STATE[e.target.value]?.[0] || ''); }}>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>City
            <select value={city} onChange={e => setCity(e.target.value)}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Ward / Zone
            <select value={ward} onChange={e => setWard(e.target.value)}>
              {BHOPAL_WARDS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
          <label>Colony / Locality
            <select value={locality} onChange={e => setLocality(e.target.value)}>
              {localities.map(([key, area]) => <option key={key} value={key}>{area.label}</option>)}
            </select>
          </label>
          <button type="submit" className="btn-primary btn-full">
            Continue to Jodo <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
