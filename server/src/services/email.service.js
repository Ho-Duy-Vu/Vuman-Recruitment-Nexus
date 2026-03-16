export const sendHrInviteEmail = async ({ to, fullName, tempPassword, loginUrl }) => {
  // DEMO MODE: no real email, just log details for testing
  // eslint-disable-next-line no-console
  console.log('[DEMO EMAIL] HR invite:', { to, fullName, tempPassword, loginUrl })
}

export const sendHrForceResetEmail = async ({ to, fullName, tempPassword, loginUrl }) => {
  // DEMO MODE: no real email, just log details for testing
  // eslint-disable-next-line no-console
  console.log('[DEMO EMAIL] HR force reset:', { to, fullName, tempPassword, loginUrl })
}

export const sendApplyConfirm = async ({ to, jobTitle }) => {
  // DEMO MODE: log only
  // eslint-disable-next-line no-console
  console.log('[DEMO EMAIL] Apply confirm:', { to, jobTitle })
}

