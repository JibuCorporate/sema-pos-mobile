import {
  parseISO,
  isSameDay,
  differenceInMilliseconds,
} from 'date-fns';

class SyncUtils {
  compareRemoteAndLocal(otherArray, property) {
    return (current) => otherArray.filter((other) => {
      const currentDatediff = differenceInMilliseconds(
        new Date(current.created_at),
        new Date(other.created_at),
      );

      const updateDatediff = differenceInMilliseconds(
        new Date(current.updated_at),
        new Date(other.updated_at),
      );

      const isSameCurrentDay = this.isSimilarDay(
        current.created_at,
        other.created_at,
      );

      const isSameUpdateDay = this.isSimilarDay(
        current.updated_at,
        other.updated_at,
      );

      return ((other[property] === current[property])
          && ((currentDatediff > 0 || isSameCurrentDay)
            && (updateDatediff > 0 || isSameUpdateDay))
      );
    }).length === 0;
  }

  compareRemoteAndLocal2(option1, option2, property) {
    const newArray = [];
    for (var i in option1) {
      const result = option2.filter((e) => (
        (e[property] === option1[i][property])
          && (this.isSimilarDay(e.created_at, option1[i].created_at)
            || this.isSimilarDay(e.updated_at, option1[i].updated_at))
      ));

      if (result.length === 0) {
        newArray.push(option1[i]);
      }

      for (const b in result) {
        const currentDatediff = differenceInMilliseconds(
          new Date(option1[i].created_at),
          new Date(result[b].created_at),
        );

        const updateDatediff = differenceInMilliseconds(
          new Date(option1[i].updated_at),
          new Date(result[b].updated_at),
        );
        if (currentDatediff > 0 || updateDatediff > 0) {
          newArray.push(option1[i]);
        }
      }
    }
    return newArray;
  }

  isSimilarDay(dayRight, dateLeft) {
    if (dayRight === undefined || dateLeft === undefined) {
      return false;
    }
    if (dayRight === null || dateLeft === null) {
      return false;
    }
    dayRight = typeof dayRight === 'string' ? dayRight.split('T')[0] : dayRight.toISOString().split('T')[0];
    dateLeft = typeof dateLeft === 'string' ? dateLeft.split('T')[0] : dateLeft.toISOString().split('T')[0];

    return isSameDay(parseISO(dayRight), parseISO(dateLeft));
  }

  convertDate(dayRight) {
    if (dayRight === undefined) {
      return false;
    }
    if (dayRight === null) {
      return false;
    }
    dayRight = typeof dayRight === 'string' ? dayRight.split('T')[0] : dayRight.toISOString().split('T')[0];

    return dayRight;
  }
}
export default new SyncUtils();
