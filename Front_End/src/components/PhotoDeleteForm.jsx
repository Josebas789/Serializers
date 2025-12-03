import { useState } from 'react';
import { api } from '../api'

export default function PhotoDeleteForm({ photo, onClose, onPhotoDeleted }) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

        const handleConfirmDelete = async () => {
            try {

            await api.delete(`photos/${photo}/`);
            onPhotoDeleted(photo)
            onClose();

            } catch (err) {
            console.error('Error eliminando foto', err.response || err)
            setError('No se pudo eliminar la foto.')
            } finally {
                setLoading('false')
            }   
        };

        return (
            <div>
                <p>Esta acción es irreversible</p>
                {error && <p className="error-message">{error}</p>}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={loading}
                        className="secondary-button"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={handleConfirmDelete} 
                        disabled={loading}
                        className="add-button"
                    >
                        {loading ? 'Eliminando...' : 'Sí, eliminar'}
                    </button>
                </div>    
            </div>  
            
        )
}