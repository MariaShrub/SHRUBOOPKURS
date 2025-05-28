import { Standing, Participant } from '../types';
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  CellContext,
} from '@tanstack/react-table';

interface StandingsTableProps {
  standings: Standing[];
  participants: Participant[];
  highlightTop?: number;
  showTiebreakers?: boolean;
}

interface EnrichedStanding extends Standing {
  participant?: Participant;
  fullName: string;
  isEmpty: boolean;
}

const StandingsTable = ({
  standings,
  participants,
  highlightTop = 3,
  showTiebreakers = true
}: StandingsTableProps) => {
  // Обогащаем данные участников для таблицы
  const enrichedStandings: EnrichedStanding[] = standings.map(standing => {
    const participant = participants.find(p => p.id === standing.participantId);
    return {
      ...standing,
      participant,
      fullName: participant ? `${participant.firstName} ${participant.lastName}` : '',
      isEmpty: participant?.isEmpty || false
    };
  }).filter(standing => standing.participant);

  // Явно типизированные колонки
  const columns: ColumnDef<EnrichedStanding>[] = [
    {
      accessorKey: 'position',
      header: '#',
      cell: (info: CellContext<EnrichedStanding, number>) => (
        <span className="position-badge">
          {info.getValue()}
        </span>
      ),
      size: 50,
    },
    {
      accessorKey: 'fullName',
      header: 'Участник',
      cell: (info: CellContext<EnrichedStanding, string>) => (
        <>
          {info.getValue()}
          {info.row.original.isEmpty && (
            <span className="empty-badge">[Пустой]</span>
          )}
        </>
      ),
      size: 200,
    },
    {
      accessorKey: 'points',
      header: 'Очки',
      cell: (info: CellContext<EnrichedStanding, number>) => (
        info.getValue().toFixed(1)
      ),
      size: 80,
    },
    {
      accessorKey: 'wins',
      header: 'Победы',
      size: 80,
    },
    {
      accessorKey: 'draws',
      header: 'Ничьи',
      size: 80,
    },
    {
      accessorKey: 'losses',
      header: 'Поражения',
      size: 80,
    },
    ...(showTiebreakers ? [
      {
        accessorKey: 'participant.rating',
        header: 'Рейтинг',
        cell: (info: CellContext<EnrichedStanding, number | undefined>) => (
          info.getValue() || '-'
        ),
        size: 80,
      },
      {
        accessorKey: 'buchholz',
        header: 'Бухгольц',
        cell: (info: CellContext<EnrichedStanding, number | undefined>) => (
          info.row.original.position <= highlightTop 
            ? info.getValue()?.toFixed(1) 
            : '-'
        ),
        size: 80,
      },
      {
        accessorKey: 'berger',
        header: 'Бергер',
        cell: (info: CellContext<EnrichedStanding, number | undefined>) => (
          info.row.original.position <= highlightTop 
            ? info.getValue()?.toFixed(1) 
            : '-'
        ),
        size: 80,
      },
    ] : []),
  ];

  const table = useReactTable({
    data: enrichedStandings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const getRowClass = (position: number) => {
    if (position <= highlightTop) {
      return `top-${position}`;
    }
    return '';
  };

  return (
    <div className="standings-table-container">
      <table className="standings-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id} 
                  className={`${header.id}-col`}
                  style={{ width: header.getSize() }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className={getRowClass(row.original.position)}
            >
              {row.getVisibleCells().map(cell => (
                <td 
                  key={cell.id} 
                  className={`${cell.column.id}-cell`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;