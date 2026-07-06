export default function WorkflowConnector({ onAdd, label = "Add activity" }) {
  return (
    <div className="wf-connector">
      <div className="wf-connector__line" aria-hidden="true" />
      <button
        type="button"
        className="wf-connector__add"
        onClick={onAdd}
        title={label}
        aria-label={label}
      >
        +
      </button>
    </div>
  )
}
