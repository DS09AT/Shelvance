using System.Collections.Generic;
using System.Linq;
using Dapper;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public interface IGutenbergCatalogRepository : IBasicRepository<GutenbergBook>
    {
        List<GutenbergBook> Search(string query);
        List<GutenbergBook> GetRecent(int count);
        GutenbergBook FindByGutenbergId(int gutenbergId);
        void DeleteAll();
        int GetBookCount();
    }

    public class GutenbergCatalogRepository : BasicRepository<GutenbergBook>, IGutenbergCatalogRepository
    {
        public GutenbergCatalogRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<GutenbergBook> Search(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<GutenbergBook>();
            }

            var searchTerms = query.ToLowerInvariant()
                .Split(' ')
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(term => $"%{term}%")
                .ToList();

            using (var conn = _database.OpenConnection())
            {
                var sql = "SELECT * FROM GutenbergBooks WHERE 1=1";

                for (var i = 0; i < searchTerms.Count; i++)
                {
                    sql += $" AND (LOWER(Title) LIKE @term{i} OR LOWER(Author) LIKE @term{i} OR LOWER(Subjects) LIKE @term{i})";
                }

                var parameters = new DynamicParameters();
                for (var i = 0; i < searchTerms.Count; i++)
                {
                    parameters.Add($"term{i}", searchTerms[i]);
                }

                return conn.Query<GutenbergBook>(sql, parameters).ToList();
            }
        }

        public List<GutenbergBook> GetRecent(int count)
        {
            return Query(Builder().OrderBy("\"LastUpdated\" DESC"))
                .Take(count)
                .ToList();
        }

        public GutenbergBook FindByGutenbergId(int gutenbergId)
        {
            return Query(b => b.GutenbergId == gutenbergId).FirstOrDefault();
        }

        public void DeleteAll()
        {
            Purge();
        }

        public int GetBookCount()
        {
            return Count();
        }
    }
}
