const BASE = '/api'

const req = (method, path, body) => fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
}).then(async r => {
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Error del servidor')
    return data
})

export const getMedications = () => req('GET', '/doctor/medications')
export const addMedication = (data) => req('POST', '/doctor/medications', data)
export const deleteMedication = (id) => req('DELETE', `/doctor/medications/${id}`)
export const assignMedication = (id, val) => req('PATCH', `/doctor/medications/${id}/assign`, { assigned: val })

export const getStudies = () => req('GET', '/doctor/studies')
export const addStudy = (data) => req('POST', '/doctor/studies', data)
export const deleteStudy = (id) => req('DELETE', `/doctor/studies/${id}`)
export const assignStudy = (id, val) => req('PATCH', `/doctor/studies/${id}/assign`, { assigned: val })
