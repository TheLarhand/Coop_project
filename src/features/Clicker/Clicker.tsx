import { useDispatch, useSelector } from 'react-redux'
import { 
  increment, 
  decrement, 
  resetCounter, 
  selectCounter,
} from '../../store/slices/testSlice'
import s from './Clicker.module.scss'
import Button from '../../shared/ui/Button/Button'

function Clicker() {
  const dispatch = useDispatch()
  const counter = useSelector(selectCounter)

  const handleIncrement = () => {
    dispatch(increment())
  }

  const handleDecrement = () => {
    dispatch(decrement())
  }

  const handleReset = () => {
    dispatch(resetCounter())
  }

  return (
    <div className={s.wrapper}>
      <div className={s.clicker}>
        <h3>Кликер</h3>
        <div className={s.counterDisplay}>
          {counter}
        </div>
        <div className={s.buttons}>
          <Button onClick={handleDecrement} variant="danger">
            -
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Сброс
          </Button>
          <Button onClick={handleIncrement} variant="primary">
            +
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Clicker