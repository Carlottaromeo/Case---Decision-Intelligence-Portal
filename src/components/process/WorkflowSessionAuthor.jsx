import { useState } from "react"
import { useSession } from "../../context/SessionContext"

const AVATAR_SRC = "/profile-avatar.png"

export default function WorkflowSessionAuthor({ prefix = "Posting as" }) {
  const { user } = useSession()
  const [avatarError, setAvatarError] = useState(false)

  if (!user) return null

  return (
    <div className="wf-session-author">
      {avatarError ? (
        <span className="wf-session-author__avatar">{user.initials}</span>
      ) : (
        <img
          className="wf-session-author__avatar-img"
          src={AVATAR_SRC}
          alt={user.name}
          onError={() => setAvatarError(true)}
        />
      )}
      <span className="wf-session-author__text">
        {prefix} <strong>{user.name}</strong>
      </span>
    </div>
  )
}
