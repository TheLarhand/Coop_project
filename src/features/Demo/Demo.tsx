import { useState } from "react"
import Input from "../../shared/ui/Input/Input"
import Textarea from "../../shared/ui/Textarea/Textarea"
import Select from "../../shared/ui/Select/Select"
import Checkbox from "../../shared/ui/Checkbox/Checkbox"
import Radio from "../../shared/ui/Radio/Radio"
import Button from "../../shared/ui/Button/Button"
import Switch from "../../shared/ui/Switch/Switch"

import s from "./Demo.module.scss"

function Demo() {
  const [text, setText] = useState("")
  const [message, setMessage] = useState("")
  const [hero, setHero] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [agree, setAgree] = useState(false)
  const [selected, setSelected] = useState("option1")

  const [num, setNum] = useState<number | null>(null)
  const [bool, setBool] = useState<boolean | null>(null)

  const heroes = [
    { value: "batman", label: "Batman" },
    { value: "superman", label: "Superman" },
    { value: "ironman", label: "Iron Man" },
    { value: "thor", label: "Thor" },
    { value: "hulk", label: "Hulk" },
    { value: "spiderman", label: "Spidy" },
  ]

  return (
    <div className={s.wrapper}>
      <h2>UI Components Demo</h2>

      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text"
      />

      <Textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Enter message"
      />

      <Select
        value={hero}
        onChange={setHero}
        options={heroes}
        placeholder="Choose hero"
      />

      {/* Поисковик в дропдауне появляется при количестве option больше 5  */}

      <Select
        value={num}
        onChange={setNum}
        options={[
          { label: "Один", value: 1 },
          { label: "Два", value: 2 },
          { label: "Три", value: 3 },
        ]}
        placeholder="Выбери число"
      /><h2>{num!==null &&  num * num}</h2>

      <Select
        value={bool}
        onChange={setBool}
        options={[
          { label: "Да", value: true },
          { label: "Нет", value: false },
        ]}
        placeholder="Выбери ответ"
      />

      <Switch
        checked={enabled}
        onChange={setEnabled}
        variant="secondary"
        label="Toggle"
      />

      <Checkbox
        checked={agree}
        onChange={setAgree}
        label="I agree"
      />

      <div style={{ display: "flex", gap: "1rem" }}>
        <Radio
          checked={selected === "option1"}
          onChange={() => setSelected("option1")}
          label="Option 1"
        />
        <Radio
          checked={selected === "option2"}
          onChange={() => setSelected("option2")}
          label="Option 2"
        />
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
      </div>
    </div>
  )
}

export default Demo
