import {
  acquireSubmissionLock,
  isConfirmedOrderResult,
  readStoredArray,
  releaseSubmissionLock,
} from "./criticalPathGuards";

describe("criticalPathGuards", () => {
  test("restores persisted arrays and rejects malformed storage", () => {
    const storage = {
      getItem: jest.fn(() =>
        JSON.stringify([
          {
            key: "one-5ml",
            quantity: 2,
          },
        ])
      ),
    };

    expect(
      readStoredArray(
        storage,
        "playnice_cart"
      )
    ).toEqual([
      {
        key: "one-5ml",
        quantity: 2,
      },
    ]);

    storage.getItem.mockReturnValueOnce(
      "{not-json"
    );

    expect(
      readStoredArray(
        storage,
        "playnice_cart"
      )
    ).toEqual([]);

    storage.getItem.mockReturnValueOnce(
      JSON.stringify({
        key: "not-an-array",
      })
    );

    expect(
      readStoredArray(
        storage,
        "playnice_cart"
      )
    ).toEqual([]);
  });

  test("accepts only fully confirmed checkout results", () => {
    expect(
      isConfirmedOrderResult({
        success: true,
        orderPlaced: true,
        orderId: "PN2609-1234",
      })
    ).toBe(true);

    expect(
      isConfirmedOrderResult({
        success: true,
        orderPlaced: false,
        orderId: "PN2609-1234",
      })
    ).toBe(false);

    expect(
      isConfirmedOrderResult({
        success: true,
        orderPlaced: true,
      })
    ).toBe(false);
  });

  test("submission lock rejects a second checkout attempt until released", () => {
    const lockRef = {
      current: false,
    };

    expect(
      acquireSubmissionLock(lockRef)
    ).toBe(true);

    expect(
      acquireSubmissionLock(lockRef)
    ).toBe(false);

    releaseSubmissionLock(lockRef);

    expect(
      acquireSubmissionLock(lockRef)
    ).toBe(true);
  });
});
