import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shelterKeys } from '../hooks/useShelters'
import { shelterService } from '../services/shelter.service'
import './CreateShelterPage.css'

type SupplyRow = {
  id: string
  item: string
  quantity: string
  unit: string
}

function createSupplyRow(seed: number): SupplyRow {
  return { id: `supply-${seed}`, item: '', quantity: '', unit: '' }
}

function CreateShelterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()

  const locationState = location.state as { lat?: number; lng?: number } | null

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: locationState?.lat ?? null,
    lng: locationState?.lng ?? null,
    male: '', female: '',
    children: '', adults: '', elderly: '',
    medical: '', mobility: '', chronic: '', pregnant: '', infants: '',
    supplies: [createSupplyRow(1)],
    urgency: 'medium' as 'low' | 'medium' | 'high',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const createShelter = useMutation({
    mutationFn: (input: any) => shelterService.create(input),
  })


  const handleUpdateSupply = (id: string, field: keyof Omit<SupplyRow, 'id'>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      supplies: prev.supplies.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }))
  }

  const handleAddSupplyRow = () => {
    setFormData((prev) => ({
      ...prev,
      supplies: [...prev.supplies, createSupplyRow(prev.supplies.length + 1)],
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.name.trim()) return setErrorMsg('Shelter Name is required.')
    if (formData.lat === null || formData.lng === null) return setErrorMsg('Please pin a location on the map.')
    
    // Convert to numbers safely (treat empty as 0)
    const num = (val: string) => parseInt(val, 10) || 0

    // Enforce basic validation
    if (num(formData.male) < 0 || num(formData.female) < 0) return setErrorMsg('Occupancy cannot be negative.')

    setIsSubmitting(true)
    try {
      // 1. Create Shelter
      const disasterType = formData.name.toLowerCase().includes('flood') ? 'flood' : 'landslide'
      const newShelter = await createShelter.mutateAsync({
        name: formData.name,
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
        disasterType,
        capacityStatus: formData.urgency === 'high' ? 'full' : formData.urgency === 'low' ? 'available' : 'limited',
      })

      const shelterId = newShelter.id

      // 2. Set Population
      await shelterService.updatePopulation(shelterId, {
        male: num(formData.male),
        female: num(formData.female),
        children: num(formData.children),
        adults: num(formData.adults),
        elderly: num(formData.elderly),
        medical: num(formData.medical),
        mobility: num(formData.mobility),
        chronic: num(formData.chronic),
        pregnant: num(formData.pregnant),
        infants: num(formData.infants),
      })

      // 3. Set Needs sequentially
      for (const row of formData.supplies) {
        if (row.item.trim() && row.quantity.trim()) {
          await shelterService.addNeed(shelterId, {
            item: `${row.item.trim()} (${row.unit})`.trim(),
            quantity: num(row.quantity),
            fulfilled: 0,
            priority: formData.urgency, // tie priority to urgency level for now
          })
        }
      }

      await qc.invalidateQueries({ queryKey: shelterKeys.all })
      navigate('/shelters')

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.response?.data?.message || 'Failed to create shelter')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="create-shelter-page">
      <header className="create-shelter-header">
        <h1>Create Shelter</h1>
      </header>

      <form className="create-shelter-form" onSubmit={handleSave}>
        
        <div className="form-group">
          <label>Shelter Name<span className="required">*</span></label>
          <input 
            type="text" 
            placeholder="Enter shelter name" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Shelter Address</label>
          <input 
            type="text" 
            placeholder="Enter full address" 
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Pin Shelter Location<span className="required">*</span></label>
          <p className="sub-label">Select the shelter location on the map.</p>
          <button 
            type="button" 
            className="pin-location-btn" 
            onClick={() => navigate('/shelters/create/pin', { state: { formData } })}
          >
            {formData.lat && formData.lng ? 'Location Pinned ✓' : 'Pin location on map >'}
          </button>
        </div>

        <h2>Current Occupancy<span className="required">*</span></h2>
        <div className="form-row">
          <div className="form-group">
            <label>Male</label>
            <input type="number" min="0" placeholder="Enter number" value={formData.male} onChange={e => setFormData({...formData, male: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Female</label>
            <input type="number" min="0" placeholder="Enter number" value={formData.female} onChange={e => setFormData({...formData, female: e.target.value})} />
          </div>
        </div>

        <h2>Age Distribution<span className="required">*</span></h2>
        <div className="form-row three-cols">
          <div className="form-group">
            <label>Children (0-14)</label>
            <input type="number" min="0" placeholder="Enter number" value={formData.children} onChange={e => setFormData({...formData, children: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Adults (15-64)</label>
            <input type="number" min="0" placeholder="Enter number" value={formData.adults} onChange={e => setFormData({...formData, adults: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Elderly (65+)</label>
            <input type="number" min="0" placeholder="Enter number" value={formData.elderly} onChange={e => setFormData({...formData, elderly: e.target.value})} />
          </div>
        </div>

        <h2>Health Conditions<span className="required">*</span></h2>
        <div className="form-group">
          <label>Medical Attention Needed</label>
          <input type="number" min="0" placeholder="Enter number" value={formData.medical} onChange={e => setFormData({...formData, medical: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Limited Mobility</label>
          <input type="number" min="0" placeholder="Enter number" value={formData.mobility} onChange={e => setFormData({...formData, mobility: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Chronic Illness</label>
          <input type="number" min="0" placeholder="Enter number" value={formData.chronic} onChange={e => setFormData({...formData, chronic: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Pregnant Women</label>
          <input type="number" min="0" placeholder="Enter number" value={formData.pregnant} onChange={e => setFormData({...formData, pregnant: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Infants / Babies</label>
          <input type="number" min="0" placeholder="Enter number" value={formData.infants} onChange={e => setFormData({...formData, infants: e.target.value})} />
        </div>

        <h2>Supplies Needed</h2>
        <div className="supplies-list">
          <div className="supplies-header">
            <span>Supply Item</span>
            <span>Quantity</span>
            <span>Unit</span>
          </div>
          {formData.supplies.map(row => (
            <div key={row.id} className="supply-row">
              <input type="text" placeholder="e.g. Clean Water" value={row.item} onChange={e => handleUpdateSupply(row.id, 'item', e.target.value)} />
              <input type="number" min="0" placeholder="e.g. 50" value={row.quantity} onChange={e => handleUpdateSupply(row.id, 'quantity', e.target.value)} />
              <input type="text" placeholder="e.g. liters" value={row.unit} onChange={e => handleUpdateSupply(row.id, 'unit', e.target.value)} />
            </div>
          ))}
          <button type="button" className="add-supply-btn" onClick={handleAddSupplyRow}>+</button>
        </div>

        <h2>Urgency Level<span className="required">*</span></h2>
        <div className="urgency-options">
          <label className="radio-label">
            <input type="radio" name="urgency" value="low" checked={formData.urgency === 'low'} onChange={() => setFormData({...formData, urgency: 'low'})} />
            Low
          </label>
          <label className="radio-label">
            <input type="radio" name="urgency" value="medium" checked={formData.urgency === 'medium'} onChange={() => setFormData({...formData, urgency: 'medium'})} />
            Medium
          </label>
          <label className="radio-label">
            <input type="radio" name="urgency" value="high" checked={formData.urgency === 'high'} onChange={() => setFormData({...formData, urgency: 'high'})} />
            High
          </label>
        </div>

        {errorMsg && <p className="error-message">{errorMsg}</p>}

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/shelters')}>Cancel</button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default CreateShelterPage
