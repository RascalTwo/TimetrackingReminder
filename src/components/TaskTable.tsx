import type { R2Event } from "../types";

export default function TaskTable({ events }: { events: R2Event[] }) {
  return <table>
    <caption>Task Totals</caption>
    <thead>
      <tr>
        <th>Task</th>
        <th>Hours</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Total</td>
        <td>{events.reduce((total, event) => total + ((event.end.getTime() - event.start.getTime()) / 1000 / 60 / 60), 0)}</td>
      </tr>
      <tr>
        <td>Total (Gapless)</td>
        <td>{events.filter(e => e.task !== 'Gap').reduce((total, event) => total + ((event.end.getTime() - event.start.getTime()) / 1000 / 60 / 60), 0)}</td>
      </tr>
      {Object.entries(events.reduce((tasks, event) => {
        tasks[event.task] = (tasks[event.task] || 0) + ((event.end.getTime() - event.start.getTime()) / 1000 / 60 / 60);
        return tasks;
      }, {} as Record<string, number>)).map(([task, hours]) =>
        <tr key={task}>
          <td>{task}</td>
          <td>{hours}</td>
        </tr>
      )}
    </tbody>
  </table>
}