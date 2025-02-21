;; Data Ownership Contract

(define-map personal-data
  { id: uint }
  {
    owner: principal,
    data-type: (string-ascii 64),
    data-hash: (buff 32)
  }
)

(define-data-var next-id uint u0)

(define-public (register-data (data-type (string-ascii 64)) (data-hash (buff 32)))
  (let ((id (var-get next-id)))
    (var-set next-id (+ id u1))
    (ok (map-set personal-data
      { id: id }
      {
        owner: tx-sender,
        data-type: data-type,
        data-hash: data-hash
      }
    ))
  )
)

(define-public (transfer-ownership (id uint) (new-owner principal))
  (let ((data (unwrap! (map-get? personal-data { id: id }) (err u404))))
    (asserts! (is-eq tx-sender (get owner data)) (err u403))
    (ok (map-set personal-data
      { id: id }
      (merge data { owner: new-owner })
    ))
  )
)

(define-read-only (get-data-info (id uint))
  (map-get? personal-data { id: id })
)

