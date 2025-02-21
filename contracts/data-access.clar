;; Data Access Contract

(define-map data-permissions
  { data-id: uint, accessor: principal }
  {
    owner: principal,
    access-type: (string-ascii 20)
  }
)

(define-public (grant-access (data-id uint) (accessor principal) (access-type (string-ascii 20)))
  (ok (map-set data-permissions
    { data-id: data-id, accessor: accessor }
    {
      owner: tx-sender,
      access-type: access-type
    }
  ))
)

(define-public (revoke-access (data-id uint) (accessor principal))
  (let ((current-permission (unwrap! (map-get? data-permissions { data-id: data-id, accessor: accessor }) (err u404))))
    (asserts! (is-eq tx-sender (get owner current-permission)) (err u403))
    (ok (map-delete data-permissions { data-id: data-id, accessor: accessor }))
  )
)

(define-read-only (check-access (data-id uint) (accessor principal))
  (map-get? data-permissions { data-id: data-id, accessor: accessor })
)

