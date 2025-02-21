;; Compliance Contract

(define-constant CONTRACT_OWNER tx-sender)

(define-map data-regulations
  { data-type: (string-ascii 64) }
  { required-consent: bool }
)

(define-map user-consents
  { user: principal, data-type: (string-ascii 64) }
  { consented: bool }
)

(define-public (set-regulation (data-type (string-ascii 64)) (required-consent bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err u403))
    (ok (map-set data-regulations
      { data-type: data-type }
      { required-consent: required-consent }
    ))
  )
)

(define-public (give-consent (data-type (string-ascii 64)))
  (ok (map-set user-consents
    { user: tx-sender, data-type: data-type }
    { consented: true }
  ))
)

(define-public (revoke-consent (data-type (string-ascii 64)))
  (ok (map-set user-consents
    { user: tx-sender, data-type: data-type }
    { consented: false }
  ))
)

(define-read-only (check-compliance (data-type (string-ascii 64)) (user principal))
  (let
    (
      (regulation (unwrap! (map-get? data-regulations { data-type: data-type }) (err u404)))
      (consent (default-to { consented: false } (map-get? user-consents { user: user, data-type: data-type })))
    )
    (ok (or (not (get required-consent regulation)) (get consented consent)))
  )
)

