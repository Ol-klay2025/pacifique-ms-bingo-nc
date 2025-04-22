import React from 'react';

export const Table = React.forwardRef(({ className = '', ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={`w-full caption-bottom text-sm ${className}`}
      {...props}
    />
  </div>
));

export const TableHeader = React.forwardRef(({ className = '', ...props }, ref) => (
  <thead ref={ref} className={`border-b bg-gray-50 ${className}`} {...props} />
));

export const TableBody = React.forwardRef(({ className = '', ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y ${className}`}
    {...props}
  />
));

export const TableFooter = React.forwardRef(({ className = '', ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`border-t bg-gray-50 font-medium ${className}`}
    {...props}
  />
));

export const TableRow = React.forwardRef(({ className = '', ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50 ${className}`}
    {...props}
  />
));

export const TableHead = React.forwardRef(({ className = '', ...props }, ref) => (
  <th
    ref={ref}
    className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));

export const TableCell = React.forwardRef(({ className = '', ...props }, ref) => (
  <td
    ref={ref}
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));

export const TableCaption = React.forwardRef(({ className = '', ...props }, ref) => (
  <caption
    ref={ref}
    className={`mt-4 text-sm text-gray-500 ${className}`}
    {...props}
  />
));