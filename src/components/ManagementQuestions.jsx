import { useMemo, useState } from "react"
import { C } from "../theme"
import { useMeasuredData } from "../context/DashboardDataContext"
import { SH } from "./UI"
import NotificationBanner from "./NotificationBanner"
import {
  MANAGEMENT_QUESTIONS,
  loadManagementContext,
  answerManagementQuestion,
} from "../data/managementQuestions"
import ManagementAnswerPanel from "./management/ManagementAnswerPanel"

export default function ManagementQuestions() {
  const measured = useMeasuredData()
  const [selectedId, setSelectedId] = useState(MANAGEMENT_QUESTIONS[0].id)

  const ctx = useMemo(() => loadManagementContext(measured), [measured])
  const selected = MANAGEMENT_QUESTIONS.find((q) => q.id === selectedId)
  const answer = useMemo(
    () => answerManagementQuestion(selectedId, ctx),
    [selectedId, ctx]
  )
