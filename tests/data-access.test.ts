import { describe, it, beforeEach, expect } from "vitest"

describe("Data Access Contract", () => {
  let mockStorage: Map<string, any>
  
  beforeEach(() => {
    mockStorage = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "grant-access":
        const [dataId, accessor, accessType] = args
        mockStorage.set(`${dataId}-${accessor}`, { owner: sender, access_type: accessType })
        return { success: true }
      
      case "revoke-access":
        const [revokeDataId, revokeAccessor] = args
        const permission = mockStorage.get(`${revokeDataId}-${revokeAccessor}`)
        if (!permission) return { success: false, error: 404 }
        if (permission.owner !== sender) return { success: false, error: 403 }
        mockStorage.delete(`${revokeDataId}-${revokeAccessor}`)
        return { success: true }
      
      case "check-access":
        const [checkDataId, checkAccessor] = args
        return { success: true, value: mockStorage.get(`${checkDataId}-${checkAccessor}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should grant access", () => {
    const result = mockContractCall("grant-access", [1, "user2", "read"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should revoke access", () => {
    mockContractCall("grant-access", [1, "user2", "read"], "user1")
    const result = mockContractCall("revoke-access", [1, "user2"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should not revoke access if not the owner", () => {
    mockContractCall("grant-access", [1, "user2", "read"], "user1")
    const result = mockContractCall("revoke-access", [1, "user2"], "user3")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should check access", () => {
    mockContractCall("grant-access", [1, "user2", "read"], "user1")
    const result = mockContractCall("check-access", [1, "user2"], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({ owner: "user1", access_type: "read" })
  })
})

