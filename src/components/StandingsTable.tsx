import { Standing, Participant } from '../types';
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

interface StandingsTableProps {
  standings: Standing[];
  participants: Participant[];
  highlightTop?: number;
  showTiebreakers?: boolean;
}

const StandingsTable = ({
  standings,
  participants,
  highlightTop = 3,
  showTiebreakers = true
}: StandingsTableProps) => {
  // Подготовка данных
  const data = standings.map(standing => {
    const participant = participants.find(p => p.id === standing.participantId);
    return {
      ...standing,
      participant,
      fullName: participant ? `${participant.firstName} ${participant.lastName}` : '',
      isEmpty: participant?.isEmpty || false
    };
  }).filter(row => row.participant);

  // Определение колонок
  const columns = [
    {
      accessorKey: 'position',
      header: '#',
      cell: (props: any) => (
        <span className="position-badge">
          {props.row.original.position}
        </span>
      ),
      size: 50,
    },
    {
      accessorKey: 'fullName',
      header: 'Участник',
      cell: (props: any) => (
        <>
          {props.row.original.fullName}
          {props.row.original.isEmpty && (
            <span className="empty-badge">[Пустой]</span>
          )}
        </>
      ),
      size: 200,
    },
    {
      accessorKey: 'points',
      header: 'Очки',
      cell: (props: any) => props.row.original.points.toFixed(1),
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
        cell: (props: any) => props.row.original.participant?.rating || '-',
        size: 80,
      },
      {
        accessorKey: 'buchholz',
        header: 'Бухгольц',
        cell: (props: any) => (
          props.row.original.position <= highlightTop 
            ? props.row.original.buchholz?.toFixed(1) 
            : '-'
        ),
        size: 80,
      },
      {
        accessorKey: 'berger',
        header: 'Бергер',
        cell: (props: any) => (
          props.row.original.position <= highlightTop 
            ? props.row.original.berger?.toFixed(1) 
            : '-'
        ),
        size: 80,
      },
    ] : []),
  ];

  const table = useReactTable({
    data,
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