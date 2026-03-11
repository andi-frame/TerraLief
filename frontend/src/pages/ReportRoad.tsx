import { useEffect, useMemo, useState } from 'react'
import ReliefMap, { type ReliefMarker } from '../component/ReliefMap'
import { ACEH_CENTER, SHELTER_MAP_ITEMS } from './mockData'
import './ReportRoad.css'

type ReportStep = 'search' | 'draw' | 'complete'
type StartMode = 'current' | 'manual'

type ReportDraft = {
    step: ReportStep
    destinationId: number | null
    searchQuery: string
    startMode: StartMode
    manualStart: string
    routePoints: [number, number][]
    redoPoints: [number, number][]
    hazardPointIndexes: number[]
    warnings: string
    photoName: string
}

type StoredSubmission = ReportDraft & {
    submittedAt: string
}

const REPORT_SUBMISSIONS_KEY = 'terralief-report-road-submissions'
const DEFAULT_START_POSITION = [4.6848, 96.7659] as [number, number]

const getInitialDraft = (): ReportDraft => ({
    step: 'search',
    destinationId: null,
    searchQuery: '',
    startMode: 'current',
    manualStart: '',
    routePoints: [],
    redoPoints: [],
    hazardPointIndexes: [],
    warnings: '',
    photoName: '',
})

function ReportRoadPage() {
    const [draft, setDraft] = useState<ReportDraft>(() => getInitialDraft())
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isHazardEditorOpen, setIsHazardEditorOpen] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    useEffect(() => {
        setDraft(getInitialDraft())
        setIsSearchOpen(false)
        setIsHazardEditorOpen(false)
        setToastMessage('')
    }, [])

    useEffect(() => {
        if (!toastMessage) {
            return
        }

        const timeout = window.setTimeout(() => setToastMessage(''), 3000)

        return () => window.clearTimeout(timeout)
    }, [toastMessage])

    const destinationOptions = useMemo(() => {
        const query = draft.searchQuery.trim().toLowerCase()

        if (!query) {
            return SHELTER_MAP_ITEMS
        }

        return SHELTER_MAP_ITEMS.filter(
            (shelter) =>
                shelter.name.toLowerCase().includes(query) ||
                shelter.location.toLowerCase().includes(query),
        )
    }, [draft.searchQuery])

    const selectedDestination = useMemo(
        () => SHELTER_MAP_ITEMS.find((shelter) => shelter.id === draft.destinationId) ?? null,
        [draft.destinationId],
    )

    const polylinePoints = useMemo(() => {
        if (!selectedDestination || draft.routePoints.length === 0) {
            return undefined
        }

        return [DEFAULT_START_POSITION, ...draft.routePoints, selectedDestination.latLng]
    }, [draft.routePoints, selectedDestination])

    const routeMarkers = useMemo<ReliefMarker[]>(() => {
        const markers: ReliefMarker[] = [
            {
                id: 'report-start',
                position: DEFAULT_START_POSITION,
                kind: 'current-location',
                title: draft.startMode === 'current' ? 'Current Location' : draft.manualStart || 'Manual Start',
                popup:
                    draft.startMode === 'current'
                        ? 'Using current location as route origin.'
                        : `Manual start: ${draft.manualStart || 'Pending address'}`,
            },
        ]

        if (selectedDestination) {
            markers.push({
                id: `destination-${selectedDestination.id}`,
                position: selectedDestination.latLng,
                kind: 'shelter',
                title: selectedDestination.name,
                subtitle: selectedDestination.location,
                popup: 'Destination shelter',
                urgency: selectedDestination.urgency,
                count: selectedDestination.count,
            })
        }

        draft.routePoints.forEach((point, index) => {
            const isHazard = draft.hazardPointIndexes.includes(index)

            markers.push({
                id: `draft-point-${index}`,
                position: point,
                kind: isHazard ? 'hazard-point' : 'draft-point',
                title: isHazard ? `Hazard point ${index + 1}` : `Route point ${index + 1}`,
                popup: isHazard ? 'Marked as hazard on the route.' : 'Volunteer-drawn route point.',
                sequence: index + 1,
                onClick: isHazardEditorOpen
                    ? () => {
                            setDraft((currentDraft) => {
                                const alreadySelected = currentDraft.hazardPointIndexes.includes(index)

                                return {
                                    ...currentDraft,
                                    hazardPointIndexes: alreadySelected
                                        ? currentDraft.hazardPointIndexes.filter((item) => item !== index)
                                        : [...currentDraft.hazardPointIndexes, index].sort((a, b) => a - b),
                                }
                            })
                        }
                    : undefined,
            })
        })

        return markers
    }, [draft.hazardPointIndexes, draft.manualStart, draft.routePoints, draft.startMode, isHazardEditorOpen, selectedDestination])

    const resetDraft = () => {
        setDraft(getInitialDraft())
        setIsSearchOpen(false)
        setIsHazardEditorOpen(false)
        setToastMessage('')
    }

    const beginDrawFlow = () => {
        if (!draft.destinationId || (draft.startMode === 'manual' && !draft.manualStart.trim())) {
            setToastMessage('Please choose a destination and complete the starting point first.')
            return
        }

        setDraft((currentDraft) => ({ ...currentDraft, step: 'draw' }))
        setIsSearchOpen(false)
    }

    const addRoutePoint = (position: [number, number]) => {
        if (draft.step !== 'draw' || isHazardEditorOpen) {
            return
        }

        setDraft((currentDraft) => ({
            ...currentDraft,
            routePoints: [...currentDraft.routePoints, position],
            redoPoints: [],
        }))
    }

    const undoRoutePoint = () => {
        setDraft((currentDraft) => {
            if (currentDraft.routePoints.length === 0) {
                return currentDraft
            }

            const updatedPoints = [...currentDraft.routePoints]
            const removedPoint = updatedPoints.pop()

            return {
                ...currentDraft,
                routePoints: updatedPoints,
                redoPoints: removedPoint ? [removedPoint, ...currentDraft.redoPoints] : currentDraft.redoPoints,
                hazardPointIndexes: currentDraft.hazardPointIndexes.filter((index) => index < updatedPoints.length),
            }
        })
    }

    const redoRoutePoint = () => {
        setDraft((currentDraft) => {
            if (currentDraft.redoPoints.length === 0) {
                return currentDraft
            }

            const [nextPoint, ...remainingRedoPoints] = currentDraft.redoPoints

            return {
                ...currentDraft,
                routePoints: [...currentDraft.routePoints, nextPoint],
                redoPoints: remainingRedoPoints,
            }
        })
    }

    const submitReport = () => {
        const missingRequiredFields =
            !draft.destinationId ||
            (draft.startMode === 'manual' && !draft.manualStart.trim()) ||
            draft.routePoints.length === 0 ||
            !draft.warnings.trim()

        if (missingRequiredFields) {
            setToastMessage('Please complete the required fields before submitting.')
            return
        }

        if (typeof window !== 'undefined') {
            const currentSubmissions = JSON.parse(
                window.localStorage.getItem(REPORT_SUBMISSIONS_KEY) ?? '[]',
            ) as StoredSubmission[]

            currentSubmissions.push({
                ...draft,
                submittedAt: new Date().toISOString(),
            })

            window.localStorage.setItem(REPORT_SUBMISSIONS_KEY, JSON.stringify(currentSubmissions))
        }

        setDraft((currentDraft) => ({
            ...currentDraft,
            step: 'complete',
        }))
    }

    return (
        <main className="report-road-page">
            <div className="report-road-map">
                <ReliefMap
                    center={selectedDestination?.latLng ?? ACEH_CENTER}
                    zoom={9}
                    className="report-road-map-layer"
                    markers={routeMarkers}
                    polyline={polylinePoints}
                    focusPosition={selectedDestination?.latLng ?? DEFAULT_START_POSITION}
                    focusZoom={selectedDestination ? 11 : 9}
                    onMapClick={addRoutePoint}
                />
            </div>

            {draft.step === 'search' && (
                <section className="report-card report-search-card">
                    <h1>Shelter Destination</h1>
                    <p>Select the shelter you are heading to before drawing your route.</p>

                    <div className="report-search-box">
                        <input
                            type="text"
                            value={draft.searchQuery}
                            placeholder="Search here..."
                            onFocus={() => setIsSearchOpen(true)}
                            onChange={(event) => {
                                const query = event.target.value
                                setDraft((currentDraft) => ({ ...currentDraft, searchQuery: query, destinationId: null }))
                                setIsSearchOpen(true)
                            }}
                        />

                        {isSearchOpen && destinationOptions.length > 0 && (
                            <div className="report-search-results">
                                {destinationOptions.map((shelter) => (
                                    <button
                                        key={shelter.id}
                                        type="button"
                                        onClick={() => {
                                            setDraft((currentDraft) => ({
                                                ...currentDraft,
                                                destinationId: shelter.id,
                                                searchQuery: shelter.name,
                                            }))
                                            setIsSearchOpen(false)
                                        }}
                                    >
                                        <strong>{shelter.name}</strong>
                                        <span>{shelter.location}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <h2>Starting Point</h2>
                    <p>Choose where the route should start.</p>

                    <label className="report-radio-row">
                        <input
                            type="radio"
                            checked={draft.startMode === 'current'}
                            onChange={() => setDraft((currentDraft) => ({ ...currentDraft, startMode: 'current' }))}
                        />
                        <span>Current Location</span>
                    </label>

                    <label className="report-radio-row report-radio-row--input">
                        <input
                            type="radio"
                            checked={draft.startMode === 'manual'}
                            onChange={() => setDraft((currentDraft) => ({ ...currentDraft, startMode: 'manual' }))}
                        />
                        <input
                            type="text"
                            value={draft.manualStart}
                            placeholder="e.g., Logistics Warehouse or City Hall"
                            onChange={(event) =>
                                setDraft((currentDraft) => ({
                                    ...currentDraft,
                                    startMode: 'manual',
                                    manualStart: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <div className="report-search-actions">
                        <button type="button" className="report-outline-btn" onClick={resetDraft}>
                            Back
                        </button>
                        <button type="button" className="report-primary-btn" onClick={beginDrawFlow}>
                            Draw Route
                        </button>
                    </div>
                </section>
            )}

            {draft.step === 'draw' && (
                <>
                    <div className="report-draw-sidebar">
                        <section className="report-summary-card">
                            <div className="report-summary-node">
                                <span className="report-summary-dot hollow" />
                                <div>
                                    <strong>Current Location</strong>
                                    <p>
                                        {draft.startMode === 'current'
                                            ? 'Your current position'
                                            : draft.manualStart || 'Manual start'}
                                    </p>
                                </div>
                            </div>
                            <div className="report-summary-divider" />
                            <div className="report-summary-node">
                                <span className="report-summary-dot solid" />
                                <div>
                                    <strong>Destination Shelter</strong>
                                    <p>
                                        {selectedDestination
                                            ? `${selectedDestination.name}. ${selectedDestination.location}`
                                            : 'Destination pending'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="report-banner">
                            {isHazardEditorOpen
                                ? 'Tap the route dots to mark damaged roads, obstacles, or risky areas.'
                                : 'Tap the map one point at a time to build your route to the shelter.'}
                        </div>

                        <div className="report-draw-tools">
                            <button type="button" onClick={undoRoutePoint}>
                                ↶
                            </button>
                            <button type="button" onClick={redoRoutePoint}>
                                ↷
                            </button>
                        </div>

                        {toastMessage && <div className="report-toast">{toastMessage}</div>}

                        <section className="report-bottom-sheet">
                            <button
                                type="button"
                                className="report-dark-btn"
                                onClick={() => setIsHazardEditorOpen(true)}
                                disabled={draft.routePoints.length === 0}
                            >
                                {draft.hazardPointIndexes.length > 0 ? 'Edit Hazards' : 'Add Important Point'}
                            </button>

                            <label className="report-file-btn">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setDraft((currentDraft) => ({
                                            ...currentDraft,
                                            photoName: event.target.files?.[0]?.name ?? '',
                                        }))
                                    }
                                />
                                <span>{draft.photoName || 'Add a Photo'}</span>
                            </label>

                            <div className="report-notes-block">
                                <h2>Any Tips or Warnings?</h2>
                                <p>Let others know if there’s something to watch out for.</p>
                                <textarea
                                    value={draft.warnings}
                                    placeholder="Text here.."
                                    onChange={(event) =>
                                        setDraft((currentDraft) => ({ ...currentDraft, warnings: event.target.value }))
                                    }
                                />
                            </div>
                        </section>

                        <button type="button" className="report-submit-btn" onClick={submitReport}>
                            Submit
                        </button>
                    </div>

                    {isHazardEditorOpen && (
                        <div className="report-modal-backdrop">
                            <section className="report-modal-card">
                                <h2>Mark Hazard</h2>
                                <p>Tap the route points to mark damaged roads, obstacles, or risky areas.</p>

                                <div className="report-modal-map">
                                    <ReliefMap
                                        center={selectedDestination?.latLng ?? ACEH_CENTER}
                                        zoom={11}
                                        className="report-road-map-layer"
                                        markers={routeMarkers}
                                        polyline={polylinePoints}
                                        focusPosition={selectedDestination?.latLng ?? DEFAULT_START_POSITION}
                                        focusZoom={11}
                                    />
                                </div>

                                <div className="report-modal-actions">
                                    <button
                                        type="button"
                                        className="report-outline-btn"
                                        onClick={() => setIsHazardEditorOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="report-primary-btn"
                                        onClick={() => {
                                            setIsHazardEditorOpen(false)
                                            setToastMessage('Hazard points saved locally on this device.')
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}
                </>
            )}

            {draft.step === 'complete' && (
                <div className="report-modal-backdrop report-modal-backdrop--success">
                    <section className="report-success-card">
                        <div className="report-success-icon">✓</div>
                        <h2>Route Submitted Successfully</h2>
                        <p>Thank you for helping others reach the shelter safely.</p>
                        <button type="button" className="report-primary-btn" onClick={resetDraft}>
                            Done
                        </button>
                    </section>
                </div>
            )}
        </main>
    )
}

export default ReportRoadPage