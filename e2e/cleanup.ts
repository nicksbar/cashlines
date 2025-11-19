/**
 * E2E Test Cleanup Utilities
 * Helpers to clean up test data after E2E tests complete
 */

export async function cleanupTestHouseholds() {
  try {
    // Fetch all households
    const householdsRes = await fetch('http://localhost:3000/api/households', {
      headers: {
        'x-household-id': 'user_1',
      },
    })

    if (!householdsRes.ok) {
      console.log('No households to clean up')
      return
    }

    const households = await householdsRes.json()

    // Delete test households (keep first one as default)
    for (let i = 1; i < households.length; i++) {
      const household = households[i]

      // Skip production households
      if (household.isProduction) {
        console.log(`Skipping production household: ${household.name}`)
        continue
      }

      try {
        const deleteRes = await fetch(
          `http://localhost:3000/api/households/${household.id}`,
          {
            method: 'DELETE',
            headers: {
              'x-household-id': 'user_1',
            },
          }
        )

        if (deleteRes.ok) {
          console.log(`Deleted test household: ${household.name}`)
        } else {
          console.log(
            `Failed to delete household ${household.name}: ${deleteRes.status}`
          )
        }
      } catch (err) {
        console.log(`Error deleting household ${household.name}:`, err)
      }
    }
  } catch (err) {
    console.log('Error during cleanup:', err)
  }
}
