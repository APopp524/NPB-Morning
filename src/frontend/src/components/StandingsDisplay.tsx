'use client'

import { useState, useMemo } from 'react'
import type { StandingWithTeam } from '@/src/types/standingsWithTeam'
import { StandingsTable } from './StandingsTable'

interface StandingsDisplayProps {
  central: StandingWithTeam[]
  pacific: StandingWithTeam[]
  updatedAt: string
}

type League = 'central' | 'pacific'
type SortField = 'wins' | 'losses' | 'games_back'
type SortDirection = 'asc' | 'desc'

export function StandingsDisplay({ central, pacific, updatedAt }: StandingsDisplayProps) {
  const [activeLeague, setActiveLeague] = useState<League>('central')
  const [sortField, setSortField] = useState<SortField>('games_back')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Get the active league's standings
  const activeStandings = activeLeague === 'central' ? central : pacific

  // Sort the standings based on current sort field and direction
  const sortedStandings = useMemo(() => {
    const sorted = [...activeStandings]

    sorted.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case 'wins':
          aValue = a.wins
          bValue = b.wins
          break
        case 'losses':
          aValue = a.losses
          bValue = b.losses
          break
        case 'games_back':
          // Handle null values: null/0 means first place, should come first in asc
          aValue = a.games_back ?? 0
          bValue = b.games_back ?? 0
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return sorted
  }, [activeStandings, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with default direction
      // Games back defaults to asc, others to desc
      setSortField(field)
      setSortDirection(field === 'games_back' ? 'asc' : 'desc')
    }
  }

  // Format the updated timestamp
  // Format: "Jan 8, 2026 · 3:00 AM CST"
  const formatUpdatedAt = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })
      return `${datePart} · ${timePart}`
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div>
      {/* League Toggle */}
      <div className="mb-6">
        <div
          role="tablist"
          className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1"
          aria-label="League selection"
        >
          <button
            role="tab"
            aria-selected={activeLeague === 'central'}
            aria-controls="central-tabpanel"
            id="central-tab"
            onClick={() => setActiveLeague('central')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeLeague === 'central'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Central League
          </button>
          <button
            role="tab"
            aria-selected={activeLeague === 'pacific'}
            aria-controls="pacific-tabpanel"
            id="pacific-tab"
            onClick={() => setActiveLeague('pacific')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeLeague === 'pacific'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pacific League
          </button>
        </div>
      </div>

      {/* Standings Table */}
      <div
        role="tabpanel"
        id={`${activeLeague}-tabpanel`}
        aria-labelledby={`${activeLeague}-tab`}
      >
        <StandingsTable
          standings={sortedStandings}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Last Updated Timestamp */}
      <div className="mt-4 text-sm text-gray-500">
        Last updated: {formatUpdatedAt(updatedAt)}
      </div>
    </div>
  )
}

