import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    checkApiStatus,
    selectApiStatus,
    selectTestLoading,
    selectTestError
} from '../../../store/slices/testSlice'
import { type AppDispatch } from '../../../store/store';
import Button from '../../../shared/ui/Button/Button'

function ApiStatus() {
    const dispatch = useDispatch<AppDispatch>();
    const apiStatus = useSelector(selectApiStatus)
    const loading = useSelector(selectTestLoading)
    const error = useSelector(selectTestError)

    useEffect(() => {
        dispatch(checkApiStatus())
    }, [dispatch])

    const handleCheckApi = () => {
        dispatch(checkApiStatus())
    }

    return (
        <div>
            <h3>Статус API</h3>
            <div>
                {loading ? (
                    <span>Проверка...</span>
                ) : (
                    <span>
                        {apiStatus || 'Не проверен'}
                    </span>
                )}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            <Button onClick={handleCheckApi} disabled={loading}>
                Проверить API
            </Button>
        </div>
    )
}

export default ApiStatus