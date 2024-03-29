import React from "react";
import "./App.css";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import { formatDate } from "./helpers.js";

interface IShow {
  id: string;
  name: string;
  summary: string;
  image: {
    original: string;
    medium: string;
  };
  premiered: string;
  _embedded: {
    cast: Array<ICastMember>;
  };
}

interface ICastMember {
  person: {
    name: string;
    image: {
      medium: string;
    };
  };
  character: {
    name: string;
  };
}

export default function App(): JSX.Element {
  const [query, setQuery] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [hasSearched, setHasSearched] = React.useState<boolean>(false);
  const [shows, setShows] = React.useState<Array<IShow>>([]);
  const [show, setShow] = React.useState<IShow | null>(null);

  function onQueryChange(nextQuery: string): void {
    setHasSearched(false);
    setQuery(nextQuery);
    setShows([]);
    setShow(null);
    setError("");

  }

  function onSearch(): void {
    setHasSearched(false);
    setIsLoading(true);
    setShows([]);
    setShow(null);
    setError("");

    if (query === '') {
      setError("Please enter a keyword to search for shows.");
    }

    fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
      .then((r: Response) => r.json())
      .then((json: Array<{ show: IShow }>) => {
        setHasSearched(true);
        setIsLoading(false);
        setShows(json.map((r) => r.show));
      })
      .catch(() => {
        setIsLoading(false);
        setError("Could not load shows.");
      });
  }

  function onSelectShow(show: IShow): void {
    setIsLoading(true);
    setError("");

    fetch(`https://api.tvmaze.com/shows/${show.id}?embed=cast`)
      .then((r: Response) => r.json())
      .then((json: IShow) => {
        setIsLoading(false);
        setShow(json);
      })
      .catch(() => {
        setIsLoading(false);
        setError("Could not load show details.");
      });
  }

  function onEnterKeySearch (e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      console.log("test");
      e.preventDefault();
      onSearch();
    }
  }



  return (
    <div className="app">
      <h1>TV Database</h1>
      <form className="search">
        <input
        name="form"
          id="search input"
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyPress={onEnterKeySearch}
          placeholder="Enter the name of a TV show..."
        />
        <button id="search button" type="button" onClick={onSearch} ><FaSearch className="icon"/>Search</button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      <div>
        <Loading isLoading={isLoading}>
          {show ? (
            <Show show={show} onCancel={() => setShow(null)} />
          ) : (
            <>
              {hasSearched && query && (
                <div className="results-meta">
                  {shows.length} results for "{query}"
                </div>
              )}
              <ShowList shows={shows} onSelectShow={onSelectShow} />
            </>
          )}
        </Loading>
      </div>
    </div>
  );
}

function Loading({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactChild;
}): JSX.Element {
  return isLoading ? 
    <div className = "loading-box">
        <span>Loading...</span>
        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div> : <>{children}</>;
}

function ShowList({
  shows,
  onSelectShow,
}: {
  shows: Array<IShow>;
  onSelectShow: (show: IShow) => void;
}): JSX.Element {
  return (
    <div className="show-list">
      {shows.map((show) => {
        return (
          <div
            key={show.id}
            className="show-preview"
            onClick={() => onSelectShow(show)}
          >
            {show.image ? 
              show.image && <img src={show.image.medium} alt=""/> : 
              <div className="missing-image-med"><span className="missing-image-text">Image Unavailable</span></div>
            }
            <span>{show.name}</span>
            <span>{show.premiered ? `(${show.premiered.substring(0,4)})` : "Yet to Premiere"}</span>
          </div>
        );
      })}
    </div>
  );
}

function Show({
  show,
  onCancel,
}: {
  show: IShow;
  onCancel: () => void;
}): JSX.Element {
  const cast = show._embedded.cast;

  return (
    <>
      <div className="show-back">
        <button onClick={onCancel}><FaArrowLeft className="icon"/>Back to Results</button>
      </div>
      <div className="show">
        <div className="show-image">
          {show.image ? 
            show.image && <img src={show.image.original} alt=""/> : 
            <div className="missing-image"><span className="missing-image-text">Image Unavailable</span></div>}
        </div>
        <div className="show-details">
          <h2>{show.name}</h2>
          <div className="show-meta">
            {show.premiered ? `Premiered ${formatDate(show.premiered)}` : "Yet to premiere"}
          </div>
          <div dangerouslySetInnerHTML={{ __html: show.summary }} />
          <h3>Cast</h3>
          {cast.length !== 0 ?
            <ul className="cast">
              {cast.map((member: ICastMember) => (
                <li key={member.character.name}>
                  <CastMember member={member} />
                </li>
              ))}
            </ul> :
            <span> Cast unavailable</span>
          }
        </div>
      </div>
    </>
  );
}

function CastMember({ member }: { member: ICastMember }): JSX.Element {
  return (
    <div className="cast-member">
        {member.person.image ? 
          <div className="cast-member-image"> {member.person.image && <img src={member.person.image.medium} alt="" />} </div> :
          <div className="missing-cast-image"><span className="missing-cast-msg">No Image</span></div>}
      <strong>{member.person.name}</strong>&nbsp;as&nbsp;
      {member.character.name}
    </div>
  );
}