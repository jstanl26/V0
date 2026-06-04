"use client"

import * as React from "react"
import { TrafficTaskList } from "@/components/traffic-task-list"
import { TaskCreateWizard } from "@/components/task-create-wizard"

export function TrafficPage() {
  const [showCreateWizard, setShowCreateWizard] = React.useState(false)

  if (showCreateWizard) {
    return <TaskCreateWizard onBack={() => setShowCreateWizard(false)} />
  }

  return <TrafficTaskList onCreateTask={() => setShowCreateWizard(true)} />
}
