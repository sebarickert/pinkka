export const AdminService = {
  async migrateFinancerData({
    userId,
    formData,
  }: {
    userId: string
    formData: FormData
  }): Promise<void> {
    const response = await fetch(
      `http://localhost:3000/api/migrations/financer/${userId}`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include',
      },
    )

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }
  },
}
