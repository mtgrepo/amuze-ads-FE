import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col w-full items-center justify-center">
      <img
        src='https://assets.dochipo.com/editor/animations/404-error/a6b2b4d8-520a-48df-aceb-e44b0f958919.gif'
        alt="page not found "
        className=" mb-8"
      />
      <h1 className="text-3xl font-bold text-primary mb-2">OOPS..Page Not Found!</h1>
      <Link to="/" className='underline cursor-pointer hover:text-primary'>Go to Home</Link>
    </div>
  );
}