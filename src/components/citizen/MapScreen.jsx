import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Sliders, CheckCircle, XCircle, ThumbsUp, Navigation, Share2,
  MessageSquare, Camera,
} from 'lucide-react';
import { BHOPAL_CENTER } from '../../data/locations';
import { MAP_FILTERS, getIssueTypeMeta } from '../../data/issueTypes';
import { createMarkerHtml, formatDistance, haversineKm, computePriorityTier } from '../../utils/mapUtils';
import { getResolutionSla, getDaysPending, getSlaStatus } from '../../utils/accountability';
import { useJodo } from '../../context/JodoContext';

export default function MapScreen() {
  const {
    issues, mapFilter, setMapFilter, selectedIssue, selectedIssueId, setSelectedIssueId,
    isSheetExpanded, setIsSheetExpanded, userProfile, loginUsername,
    calculateTrustScore, handleVerifyConfirm, handleVerifyReject, handleVotePriority,
    handleAddComment, verifyComment, setVerifyComment, handleVerificationImage,
    sliderPosition, sliderContainerRef, isDraggingSlider, handleSliderMove,
    translate,
  } = useJodo();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);

  const userLat = userProfile?.lat ?? BHOPAL_CENTER[0];
  const userLng = userProfile?.lng ?? BHOPAL_CENTER[1];

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView(BHOPAL_CENTER, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

  // #region agent log
  fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',runId:'map-fix',location:'MapScreen.jsx:init',message:'map initialized',data:{center:BHOPAL_CENTER},timestamp:Date.now(),hypothesisId:'MAP'})}).catch(()=>{});
  // #endregion

    const t = setTimeout(() => map.invalidateSize(), 200);

    return () => {
      clearTimeout(t);
      map.remove();
      mapInstance.current = null;
      markersLayer.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;
    markersLayer.current.clearLayers();

    issues.forEach(issue => {
      const selected = issue.id === selectedIssueId;
      const icon = L.divIcon({
        className: 'jodo-marker-wrap',
        html: createMarkerHtml(issue, selected),
        iconSize: [selected ? 38 : 32, selected ? 38 : 32],
        iconAnchor: [selected ? 19 : 16, selected ? 19 : 16],
      });
      const marker = L.marker([issue.lat, issue.lng], { icon }).addTo(markersLayer.current);
      marker.on('click', () => {
        setSelectedIssueId(issue.id);
        setIsSheetExpanded(true);
        mapInstance.current?.panTo([issue.lat, issue.lng], { animate: true });
      });
    });

    setTimeout(() => mapInstance.current?.invalidateSize(), 100);
  }, [issues, selectedIssueId, setSelectedIssueId, setIsSheetExpanded]);

  const distance = selectedIssue
    ? formatDistance(haversineKm(userLat, userLng, selectedIssue.lat, selectedIssue.lng))
    : null;

  const openNavigate = () => {
    if (!selectedIssue) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedIssue.lat},${selectedIssue.lng}`, '_blank');
  };

  const shareIssue = async () => {
    if (!selectedIssue) return;
    const text = `Jodo Issue #${selectedIssue.id}: ${selectedIssue.title} — ${selectedIssue.locality}, Bhopal`;
    if (navigator.share) await navigator.share({ title: selectedIssue.title, text });
    else { await navigator.clipboard.writeText(text); }
  };

  return (
    <div className="map-screen">
      <div className="map-filters">
        {MAP_FILTERS.map(f => (
          <button key={f.id} type="button" className={`map-filter-chip ${mapFilter === f.id ? 'active' : ''}`}
            onClick={() => setMapFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div ref={mapRef} className="map-full" />

      {issues.length === 0 && (
        <div className="map-empty-state"><MapPin size={28} /><p>No issues on map yet</p></div>
      )}

      {selectedIssue && (
        <div className={`bottom-sheet map-sheet ${isSheetExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="bottom-sheet-handle" onClick={() => setIsSheetExpanded(!isSheetExpanded)} />
          <div className="bottom-sheet-header" onClick={() => setIsSheetExpanded(!isSheetExpanded)}>
            <div className="sheet-title-row">
              <span className="sheet-type-icon">{getIssueTypeMeta(selectedIssue.category).icon}</span>
              <div>
                <h4>{selectedIssue.title}</h4>
                <span className="meta-text">{selectedIssue.reporter} · {selectedIssue.time} · {distance}</span>
              </div>
            </div>
            <span className={`status-chip ${selectedIssue.resolved ? 'resolved' : ''}`}>
              {selectedIssue.resolved ? 'Resolved' : selectedIssue.routed ? 'Routed' : selectedIssue.verifications > 0 ? 'Verified' : 'Under Review'}
            </span>
          </div>

          {isSheetExpanded && (
            <div className="bottom-sheet-content">
              <img src={selectedIssue.imageBefore} alt="" className="sheet-hero-img" />

              <div className="sheet-meta-grid">
                <div><small>Type</small><strong>{getIssueTypeMeta(selectedIssue.category).label}</strong></div>
                <div><small>Severity</small><strong>{selectedIssue.severity}/10</strong></div>
                <div><small>Ward</small><strong>{selectedIssue.ward}</strong></div>
                <div><small>Priority</small><strong className={`tier-${(selectedIssue.priorityTier || computePriorityTier(selectedIssue)).split(' ')[0].toLowerCase()}`}>{selectedIssue.priorityTier || computePriorityTier(selectedIssue)}</strong></div>
                <div><small>AI Confidence</small><strong>{selectedIssue.aiConfidence ?? '—'}%</strong></div>
                <div><small>Trust Score</small><strong>{calculateTrustScore(selectedIssue)}</strong></div>
                <div><small>Verifications</small><strong>{selectedIssue.verifications}</strong></div>
                <div><small>Votes</small><strong>{selectedIssue.votes ?? selectedIssue.support}</strong></div>
              </div>

              <div className="accountability-row">
                <div><small>{translate('resolutionSla')}</small><strong>{getResolutionSla(selectedIssue)}</strong></div>
                <div><small>{translate('daysPending')}</small><strong>{getDaysPending(selectedIssue)}d</strong></div>
                <div><small>{translate('escalation')}</small><strong>{getSlaStatus(selectedIssue).label}</strong></div>
              </div>

              <p className="issue-desc-text">{selectedIssue.desc}</p>

              {selectedIssue.comments?.length > 0 && (
                <div className="comments-block">
                  <h5><MessageSquare size={14} /> Comments</h5>
                  {selectedIssue.comments.map((c, i) => (
                    <div key={i} className="comment-item"><strong>{c.user}</strong> {c.text}<small>{c.time}</small></div>
                  ))}
                </div>
              )}

              {!selectedIssue.resolved && (
                <>
                  <div className="verify-block">
                    <h5>Community Verification</h5>
                    <div className="verify-btns">
                      <button type="button" className="btn-verify confirm" onClick={handleVerifyConfirm} disabled={selectedIssue.userVerified}>
                        <CheckCircle size={14} /> Confirm exists
                      </button>
                      <button type="button" className="btn-verify reject" onClick={handleVerifyReject} disabled={selectedIssue.userRejected}>
                        <XCircle size={14} /> Report false
                      </button>
                    </div>
                    <label className="verify-upload">
                      <Camera size={14} /> Supporting photo
                      <input type="file" accept="image/*" hidden onChange={handleVerificationImage} />
                    </label>
                    <input className="comment-input" placeholder="Add a comment…" value={verifyComment}
                      onChange={e => setVerifyComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                  </div>

                  <button type="button" className="btn-vote" onClick={handleVotePriority} disabled={selectedIssue.userVoted}>
                    <ThumbsUp size={14} /> Vote for priority ({selectedIssue.votes ?? selectedIssue.support} votes)
                  </button>

                  <div className="sheet-actions">
                    <button type="button" className="btn-outline" onClick={openNavigate}><Navigation size={14} /> Navigate</button>
                    <button type="button" className="btn-outline" onClick={shareIssue}><Share2 size={14} /> Share</button>
                    <button type="button" className="btn-primary" onClick={() => setIsSheetExpanded(true)}>Track</button>
                  </div>
                </>
              )}

              {selectedIssue.imageAfter && (
                <div className="slider-container" ref={sliderContainerRef}
                  onMouseMove={e => isDraggingSlider.current && handleSliderMove(e.clientX)}
                  onTouchMove={e => isDraggingSlider.current && handleSliderMove(e.touches[0].clientX)}>
                  <img src={selectedIssue.imageBefore} alt="Before" className="slider-img" />
                  <div className="slider-after" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                    <img src={selectedIssue.imageAfter} alt="After" className="slider-img" />
                  </div>
                  <div className="slider-divider" style={{ left: `${sliderPosition}%` }}
                    onMouseDown={() => { isDraggingSlider.current = true; }}
                    onTouchStart={() => { isDraggingSlider.current = true; }}>
                    <div className="slider-button"><Sliders size={10} /></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
