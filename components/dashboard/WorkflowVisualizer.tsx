"use client"

import { motion } from "framer-motion"
import { CheckCircle, Circle } from "lucide-react"

interface WorkflowVisualizerProps {
  steps?: string[]
  currentStep?: number
}

export function WorkflowVisualizer({ steps = [], currentStep = -1 }: WorkflowVisualizerProps) {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
      <div
        className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
        style={{
          width: `${currentStep >= 0 ? ((currentStep + 1) / steps.length) * 100 : 0}%`,
        }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStep
          const isCurrent = index === currentStep

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={isCompleted ? { scale: [1, 1.2, 1], backgroundColor: "#22c55e" } : {}}
                transition={{ duration: 0.3 }}
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                  isCompleted ? "bg-primary text-primary-foreground" : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
              </motion.div>
              <div
                className={`mt-2 text-xs font-medium ${
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
