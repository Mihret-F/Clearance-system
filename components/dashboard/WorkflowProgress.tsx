"use client"

import { motion } from "framer-motion"
import { CheckCircle, Circle, AlertCircle } from "lucide-react"

interface WorkflowProgressProps {
  steps: string[]
  currentStep: number
  rejectedStep?: number
}

export function WorkflowProgress({ steps = [], currentStep = -1, rejectedStep }: WorkflowProgressProps) {
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
          const isCompleted = index <= currentStep && index !== rejectedStep
          const isCurrent = index === currentStep
          const isRejected = index === rejectedStep

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={
                  isRejected
                    ? { scale: [1, 1.2, 1], backgroundColor: "#ef4444" }
                    : isCompleted
                      ? { scale: [1, 1.2, 1], backgroundColor: "#22c55e" }
                      : {}
                }
                transition={{ duration: 0.3 }}
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                  isRejected
                    ? "bg-red-500 text-white dark:bg-red-600"
                    : isCompleted
                      ? "bg-green-500 text-white dark:bg-green-600"
                      : isCurrent
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                }`}
              >
                {isRejected ? (
                  <AlertCircle className="h-6 w-6" />
                ) : isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </motion.div>
              <div
                className={`mt-2 text-xs font-medium ${
                  isRejected
                    ? "text-red-500 dark:text-red-400"
                    : isCurrent
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
