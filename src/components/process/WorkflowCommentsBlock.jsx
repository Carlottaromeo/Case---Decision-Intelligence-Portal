import { useState } from "react"
import { useSession } from "../../context/SessionContext"
import {
  createComment,
  formatCommentDate,
  personInitials,
} from "../../utils/workflowComments"

export default function WorkflowCommentsBlock({ card, onUpdate }) {
  const { user } = useSession()
  const [commentDraft, setCommentDraft] = useState("")
  const thread = Array.isArray(card.commentThread) ? card.commentThread : []

  const addComment = (e) => {
    e.preventDefault()
    const text = commentDraft.trim()
    if (!text || !user) return
    onUpdate({
      commentThread: [
        ...thread,
        createComment({ authorId: user.id, authorName: user.name, text }),
      ],
    })
    setCommentDraft("")
  }

  return (
    <section className="wf-activity-modal__section wf-activity-modal__section--comments">
      <h3 className="wf-activity-modal__section-title">
        Commenti
        <span className="wf-comments__count">{thread.length}</span>
      </h3>

      {thread.length > 0 ? (
        <ul className="wf-comments__thread wf-comments__thread--modal">
          {thread.map((comment) => {
            const isMine = user && comment.authorId === user.id
            return (
              <li key={comment.id} className={`wf-comment${isMine ? " wf-comment--mine" : ""}`}>
                <span className="wf-comment__avatar">{personInitials(comment.authorName)}</span>
                <div className="wf-comment__body">
                  <div className="wf-comment__meta">
                    <strong>{comment.authorName}</strong>
                    <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
                  </div>
                  <p>{comment.text}</p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="wf-comments__empty">Nessun commento ancora.</p>
      )}

      {user ? (
        <form className="wf-comments__form" onSubmit={addComment}>
          <div className="wf-comments__form-head">
            <span className="wf-comments__form-avatar">{user.initials}</span>
            <span>Commenta come <strong>{user.name}</strong></span>
          </div>
          <textarea
            value={commentDraft}
            rows={2}
            placeholder="Aggiungi un commento o una nota di approvazione…"
            onChange={(e) => setCommentDraft(e.target.value)}
          />
          <button
            type="submit"
            className="wf-builder__btn wf-builder__btn--primary wf-comments__submit"
            disabled={!commentDraft.trim()}
          >
            Pubblica commento
          </button>
        </form>
      ) : (
        <p className="wf-comments__login-hint">Accedi per lasciare un commento.</p>
      )}
    </section>
  )
}
