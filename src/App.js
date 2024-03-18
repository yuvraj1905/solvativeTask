import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [cityData, setCityData] = useState([]);
  const [pagination, setPagination] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(3);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [currentOffset, currentLimit, searchInput]);

  useEffect(() => {
    updatePagination();
  }, [totalCount, currentLimit, currentOffset]);

  const apiKey = process.env.REACT_APP_API_KEY;

  const fetchData = () => {
    setLoading(true);
    axios
      .request({
        method: "GET",
        url: "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
        params: {
          countryIds: "IN",
          namePrefix: searchInput,
          limit: currentLimit,
          offset: currentOffset,
        },
        headers: {
          "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
      })
      .then((response) => {
        setCityData(response.data.data);
        setTotalCount(response.data.metadata.totalCount);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const updatePagination = () => {
    const totalPages = Math.ceil(totalCount / currentLimit);
    const currentPage = Math.floor(currentOffset / currentLimit) + 1;
    const paginationButtons = [];

    for (let i = 1; i <= totalPages && i <= 3; i++) {
      paginationButtons.push(
        <button
          key={i}
          onClick={() => handlePagination(i - 1)}
          className={currentPage === i ? "selected" : ""}
        >
          {i}
        </button>
      );
    }

    setPagination(paginationButtons);
  };

  const handlePagination = (pageNumber) => {
    setCurrentOffset(pageNumber * currentLimit);
  };

  const updateLimit = () => {
    const newLimit = parseInt(document.getElementById("limitInput").value);
    setCurrentLimit(newLimit);
    setCurrentOffset(0);
  };

  const focusSearchBox = () => {
    document.querySelector(".search-input").focus();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        focusSearchBox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="container">
      <div className="search-box">
        <input
          className="search-input"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              setCurrentOffset(0);
            }
          }}
          placeholder="Search..."
        />
        <div className="hint-text" onClick={focusSearchBox}>
          <span className="hintText">Hint:</span> Use <strong>Ctrl + /</strong>{" "}
          to access search bar .
        </div>
      </div>
      <div className="table-container">
        {loading && <div className="spinner">Loading...</div>}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Place Name</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {cityData.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    {searchInput ? "No result found" : "Start searching"}{" "}
                  </td>
                </tr>
              ) : (
                cityData.map((city, index) => (
                  <tr key={index}>
                    <td>{currentOffset + index + 1}</td>
                    <td>{city.name}</td>
                    <td>
                      <img
                        src={`https://www.countryflags.io/${city.countryCode}/flat/64.png`}
                        alt={city.country}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="bottom-line">
        <div className="pagination">{pagination}</div>

        <div className="limit-container">
          <input
            type="number"
            id="limitInput"
            min="1"
            max="10"
            defaultValue="3"
          />
          <button onClick={updateLimit}>Update Limit</button>
        </div>
      </div>
    </div>
  );
}

export default App;
