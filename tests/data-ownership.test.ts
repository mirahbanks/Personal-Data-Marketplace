import { describe, it, beforeEach, expect } from "vitest"

describe("Data Ownership Contract", () => {
  let mockStorage: Map<string, any>
  let nextId: number
  
  beforeEach(() => {
    mockStorage = new Map()
    nextId = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "register-data":
        const [dataType, dataHash] = args
        const id = nextId++
        mockStorage.set(id, {
          owner: sender,
          data_type: dataType,
          data_hash: dataHash,
        })
        return { success: true, value: id }
      
      case "transfer-ownership":
        const [transferId, newOwner] = args
        const data = mockStorage.get(transferId)
        if (!data) return { success: false, error: 404 }
        if (data.owner !== sender) return { success: false, error: 403 }
        data.owner = newOwner
        mockStorage.set(transferId, data)
        return { success: true }
      
      case "get-data-info":
        return { success: true, value: mockStorage.get(args[0]) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should register data", () => {
    const result = mockContractCall("register-data", ["personal_info", "0x1234567890"], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(0)
  })
  
  it("should transfer ownership", () => {
    mockContractCall("register-data", ["personal_info", "0x1234567890"], "user1")
    const result = mockContractCall("transfer-ownership", [0, "user2"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should not transfer ownership if not the owner", () => {
    mockContractCall("register-data", ["personal_info", "0x1234567890"], "user1")
    const result = mockContractCall("transfer-ownership", [0, "user3"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should get data info", () => {
    mockContractCall("register-data", ["personal_info", "0x1234567890"], "user1")
    const result = mockContractCall("get-data-info", [0], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      owner: "user1",
      data_type: "personal_info",
      data_hash: "0x1234567890",
    })
  })
})

