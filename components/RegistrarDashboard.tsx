"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline"

export default function RegistrarDashboard({ user, clearanceRequests, setClearanceRequests }) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter requests that are ready for final approval (all other departments have approved)
  const finalApprovalRequests = clearanceRequests.filter(
    (request) =>
      request.status === "Pending" &&
      request.pendingDepartments.length === 1 &&
      request.pendingDepartments[0] === "Registrar",
  )

  const handleFinalApproval = async (requestId: number) => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setClearanceRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "Approved",
                pendingDepartments: [],
                updatedAt: new Date().toISOString(),
                certificateGenerated: true,
              }
            : request,
        ),
      )
    } catch (error) {
      console.error("Error approving request:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const generateCertificate = (request) => {
    // Simulate certificate generation
    const certificate = {
      studentId: request.userId,
      clearanceType: request.type,
      approvalDate: new Date().toLocaleDateString(),
      registrarName: user.username,
    }

    // In a real app, this would generate a PDF
    console.log("Generated Certificate:", certificate)
    alert("Certificate generated successfully!")
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar Dashboard</h1>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pending Final Approval</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{finalApprovalRequests.length}</p>
        </motion.div>
      </div>

      {/* Final Approval Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Final Approval Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {finalApprovalRequests.map((request) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{request.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {request.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFinalApproval(request.id)}
                        disabled={isProcessing}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </motion.button>
                      {request.status === "Approved" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => generateCertificate(request)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
